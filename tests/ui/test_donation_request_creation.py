# tests/ui/test_donation_request_creation.py
#
# Story RP-57 — Request Donation from Provider
# QA Task 1: Test request creation and status transitions
#
# Run:  pytest tests/ui/test_donation_request_creation.py -v
# ---------------------------------------------------------------

import os
import re
import time

import pytest
import requests

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


# ================================================================
# INLINE HELPERS
# ================================================================

API_BASE = os.getenv("VITE_API_BASE_URL", "http://localhost:5053").rstrip("/")


def _fresh_center_email() -> str:
    """Return a unique timestamped email for a fresh DISTRIBUTION_CENTER account."""
    return f"qa_center_{int(time.time())}@test.com"


def api_register_and_login(
    role: str,
    name: str,
    email: str,
    password: str,
    address: str = "Test Address",
    phone: str = "+94770000000",
) -> str:
    """Register a user via API and return a JWT token.

    Raises on failure — callers should wrap in try/except and call
    pytest.skip() when the backend is not reachable.
    """
    requests.post(
        f"{API_BASE}/api/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "role": role,
            "address": address,
            "phoneNumber": phone,
        },
        timeout=10,
    )
    res = requests.post(
        f"{API_BASE}/api/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["token"]


def api_create_request(token: str, food_type: str, quantity: float, unit: str) -> dict:
    """Create a donation request via the API and return the response dict."""
    res = requests.post(
        f"{API_BASE}/api/donation-requests",
        json={
            "foodType": food_type,
            "requestedQuantity": quantity,
            "unit": unit,
        },
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def login_via_ui(driver, base_url: str, email: str, password: str) -> None:
    """Log in through the React /join page and wait until a dashboard route loads."""
    driver.get(base_url.rstrip("/") + "/join")
    wait = WebDriverWait(driver, 20)

    email_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='email']"))
    )
    password_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='password']"))
    )

    email_input.clear()
    email_input.send_keys(email)
    password_input.clear()
    password_input.send_keys(password)

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    ).click()

    wait.until(EC.url_contains("/dashboard/"))


def navigate_to_create_request(driver, base_url: str) -> None:
    """Navigate directly to the create-request page and wait for the form."""
    driver.get(base_url.rstrip("/") + "/dashboard/center/create-request")
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']"))
    )


def fill_create_form(driver, food_type: str, quantity: str, unit: str) -> None:
    """Fill the create-request form fields without submitting."""
    wait = WebDriverWait(driver, 10)

    # Food Type — first text input
    text_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
    food_input = text_inputs[0]
    food_input.clear()
    food_input.send_keys(food_type)

    # Quantity — number input
    qty_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='number']"))
    )
    qty_input.clear()
    qty_input.send_keys(quantity)

    # Unit — second text input (after the number input)
    # Re-fetch to be safe after DOM updates
    text_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
    unit_input = text_inputs[1]
    unit_input.clear()
    unit_input.send_keys(unit)


def click_submit(driver) -> None:
    """Click the Submit Request button."""
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()


# ================================================================
# TESTS
# ================================================================


@pytest.mark.ui
def test_center_can_submit_donation_request(driver, base_url):
    """
    A DISTRIBUTION_CENTER can fill and submit the create-request form,
    see a green success message, and be redirected to /requests.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login(
            "DISTRIBUTION_CENTER", "QA Center", email, password
        )
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    # Login + navigate
    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    # Fill form and submit
    fill_create_form(driver, "QA Rice Test", "25", "kg")
    click_submit(driver)

    wait = WebDriverWait(driver, 20)

    # Assert success message contains "submitted" and "pending"
    wait.until(
        lambda d: (
            "submitted" in d.page_source.lower()
            and "pending" in d.page_source.lower()
        )
    )

    # Assert redirect to /requests within 5 seconds
    WebDriverWait(driver, 5).until(EC.url_contains("/dashboard/center/requests"))


@pytest.mark.ui
def test_request_form_validation_rejects_empty_fields(driver, base_url):
    """
    Submitting the create-request form with all fields empty must NOT
    navigate away — HTML5 validation or a visible error div prevents it.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    # Click submit without filling anything
    click_submit(driver)

    # Allow React a moment to react (but no sleep — use a short explicit wait)
    import time as _time
    start = _time.monotonic()
    timeout = 3.0
    navigated = False
    while _time.monotonic() - start < timeout:
        if "/create-request" not in driver.current_url:
            navigated = True
            break
        _time.sleep(0.1)

    # Either we didn't navigate away OR an error div appeared
    if navigated:
        # Redirect happened — check if an error message is on the new page
        error_visible = len(driver.find_elements(
            By.XPATH,
            "//*[contains(@class,'rose') or contains(@class,'red') or contains(@class,'error')]"
        )) > 0
        assert error_visible, (
            "Form submitted empty fields and navigated away without showing an error"
        )
    else:
        # Still on the create-request page — that's the expected happy path for this test
        assert "/create-request" in driver.current_url, (
            "Unexpected URL after empty-field submission"
        )


@pytest.mark.ui
def test_request_form_rejects_zero_quantity(driver, base_url):
    """
    Submitting a donation request with quantity = 0 must show an error
    message and keep the user on the create-request page.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    fill_create_form(driver, "QA Test", "0", "kg")
    click_submit(driver)

    wait = WebDriverWait(driver, 10)

    # Assert an error div with rose/red styling is visible
    error_div = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH,
             "//*[contains(@class,'rose') or contains(@class,'red') or contains(@class,'error')]"
             "[string-length(normalize-space()) > 0]")
        )
    )
    assert error_div.is_displayed()

    # Assert still on the create-request page
    assert "/create-request" in driver.current_url


@pytest.mark.ui
def test_created_request_has_pending_status(driver, base_url):
    """
    A request created via API must have status="pending" in the API response,
    and the UI must display a "pending" status badge on the outgoing requests page.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login(
            "DISTRIBUTION_CENTER", "QA Center", email, password
        )
        response = api_create_request(token, "QA Status Test", 10, "boxes")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    # --- API assertion ---
    assert response.get("status") == "pending", (
        f"Expected status='pending', got: {response.get('status')}"
    )

    # --- UI assertion ---
    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Wait for at least one request row or card
    wait.until(
        lambda d: (
            len(d.find_elements(By.CSS_SELECTOR, "table td")) > 0
            or len(d.find_elements(By.CSS_SELECTOR, "article")) > 0
        )
    )

    # Find any status badge and confirm at least one says "pending"
    badges = driver.find_elements(By.CSS_SELECTOR, "span.rounded-full")
    badge_texts = [b.text.strip().lower() for b in badges if b.text.strip()]

    assert any("pending" in t for t in badge_texts), (
        f"No 'pending' status badge found. Badges seen: {badge_texts}"
    )


@pytest.mark.ui
def test_outgoing_requests_page_shows_requests(driver, base_url):
    """
    After creating 2 requests via API, the outgoing requests page must
    show at least 1 row/card and display the "Outgoing Requests" heading.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login(
            "DISTRIBUTION_CENTER", "QA Center", email, password
        )
        api_create_request(token, "QA Outgoing Test 1", 5, "kg")
        api_create_request(token, "QA Outgoing Test 2", 10, "liters")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Assert heading
    wait.until(
        lambda d: "outgoing requests" in d.page_source.lower()
    )

    # Assert at least one row or card is visible
    wait.until(
        lambda d: (
            len(d.find_elements(By.CSS_SELECTOR, "table td")) > 0
            or len(d.find_elements(By.CSS_SELECTOR, "article")) > 0
        )
    )

    rows = driver.find_elements(By.CSS_SELECTOR, "table td")
    cards = driver.find_elements(By.CSS_SELECTOR, "article")
    assert len(rows) > 0 or len(cards) > 0, (
        "Expected at least one request row or card on the outgoing requests page"
    )


@pytest.mark.ui
def test_donor_cannot_access_create_request_page(driver, base_url):
    """
    A DONOR who navigates directly to /dashboard/center/create-request
    must be redirected away (ProtectedRoute) and must NOT see the submit button.
    """
    # Login as the known DONOR account
    login_via_ui(driver, base_url, "theertha@gmail.com", "123456")

    # Attempt direct navigation to the DC-only route
    driver.get(base_url.rstrip("/") + "/dashboard/center/create-request")

    wait = WebDriverWait(driver, 5)

    # The ProtectedRoute should redirect; wait up to 5 s for URL to change away
    try:
        wait.until(lambda d: "/center/create-request" not in d.current_url)
        redirected = True
    except Exception:
        redirected = False

    # Whether redirected or not, the Submit Request button must NOT be present
    submit_buttons = driver.find_elements(By.CSS_SELECTOR, "button[type='submit']")
    submit_texts = [b.text.strip() for b in submit_buttons]

    assert "Submit Request" not in submit_texts, (
        "DONOR should NOT see the 'Submit Request' button on a DC-only page"
    )

    assert redirected or "/center/create-request" not in driver.current_url, (
        "DONOR was not redirected away from /dashboard/center/create-request"
    )


# ================================================================
# NEW TESTS
# ================================================================


@pytest.mark.ui
def test_create_request_page_has_three_input_fields(driver, base_url):
    """
    The create-request form must have exactly 3 inputs:
    1 number input (requestedQuantity) and 2 text inputs (foodType + unit).
    The Submit Request button must also be present.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    number_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
    text_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")

    assert len(number_inputs) == 1, (
        f"Expected 1 number input on create-request form, found {len(number_inputs)}"
    )
    assert len(text_inputs) == 2, (
        f"Expected 2 text inputs on create-request form, found {len(text_inputs)}"
    )

    submit_btn = driver.find_elements(By.CSS_SELECTOR, "button[type='submit']")
    assert len(submit_btn) > 0, "Submit Request button not found on create-request page"


@pytest.mark.ui
def test_create_request_success_message_contains_request_id(driver, base_url):
    """
    After submitting a valid request, the success message must match the pattern
    'Request #N submitted' where N is a numeric request ID.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    fill_create_form(driver, "QA ID Test", "5", "kg")
    click_submit(driver)

    wait = WebDriverWait(driver, 20)

    # Wait for the success message to appear
    wait.until(
        lambda d: "submitted" in d.page_source.lower()
    )

    # The success message must match "Request #<digits> submitted"
    match = re.search(r"Request #\d+ submitted", driver.page_source)
    assert match is not None, (
        "Success message did not match pattern 'Request #N submitted'. "
        f"Page source excerpt: {driver.page_source[:500]}"
    )


@pytest.mark.ui
def test_outgoing_requests_page_has_status_filter_select(driver, base_url):
    """
    After creating 1 request via API, the /center/requests page must have:
    - A <select> status filter element
    - Options: value='all', value='pending', value='completed'
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
        api_create_request(token, "QA Select Test", 3, "kg")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)
    wait.until(lambda d: "outgoing requests" in d.page_source.lower())

    # The <select> must be present
    filter_select_el = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select"))
    )
    filter_select = Select(filter_select_el)

    option_values = [opt.get_attribute("value") for opt in filter_select.options]

    assert "all" in option_values, (
        f"Status filter missing 'all' option. Found: {option_values}"
    )
    assert "pending" in option_values, (
        f"Status filter missing 'pending' option. Found: {option_values}"
    )
    assert "completed" in option_values, (
        f"Status filter missing 'completed' option. Found: {option_values}"
    )


@pytest.mark.ui
def test_create_request_negative_quantity_rejected(driver, base_url):
    """
    Edge case: Submitting the create-request form with a negative quantity (-5)
    must either keep the user on the create-request page (HTML5/React validation)
    OR surface a visible error element with a 'rose' class.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    fill_create_form(driver, "QA Test", "-5", "kg")

    # Use JS click so React state updates are guaranteed to fire
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    driver.execute_script("arguments[0].click();", btn)

    # Give React / HTML5 validation a short window to act
    import time as _time
    _time.sleep(1.0)

    still_on_page = "/create-request" in driver.current_url
    error_visible = len(
        driver.find_elements(
            By.XPATH,
            "//*[contains(@class,'rose') or contains(@class,'red') or contains(@class,'error')]"
            "[string-length(normalize-space()) > 0]",
        )
    ) > 0

    assert still_on_page or error_visible, (
        "Negative quantity (-5) was accepted without staying on the page "
        "or showing a visible error element."
    )


@pytest.mark.ui
def test_create_request_very_large_quantity_accepted(driver, base_url):
    """
    Edge case: A very large but valid quantity (999999) must be accepted by the
    create-request form — a success message containing 'submitted' must appear.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    navigate_to_create_request(driver, base_url)

    fill_create_form(driver, "QA Bulk Test", "999999", "kg")

    # Use JS click so React state updates are guaranteed to fire
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    driver.execute_script("arguments[0].click();", btn)

    wait = WebDriverWait(driver, 20)

    # A success message containing "submitted" must appear
    wait.until(
        lambda d: "submitted" in d.page_source.lower()
    )

    assert "submitted" in driver.page_source.lower(), (
        "Expected a success message containing 'submitted' after submitting "
        "a very large quantity (999999), but none was found."
    )


@pytest.mark.ui
def test_outgoing_requests_page_has_create_request_link(driver, base_url):
    """
    Edge case: The /center/requests page must contain a 'Request Another Donation'
    link that navigates to /center/explore.  This guards against the link being
    accidentally removed or its href being changed during refactoring.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
        api_create_request(token, "QA Link Test", 3, "kg")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Wait for the page heading to confirm the page loaded
    wait.until(lambda d: "outgoing requests" in d.page_source.lower())

    # The link must be present
    link = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//a[normalize-space()='Request Another Donation']")
        )
    )

    href = link.get_attribute("href") or ""
    assert "/center/explore" in href, (
        f"'Request Another Donation' link href should contain '/center/explore', "
        f"but got: '{href}'"
    )
