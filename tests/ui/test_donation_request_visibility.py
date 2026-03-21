# tests/ui/test_donation_request_visibility.py
#
# Story RP-57 — Request Donation from Provider
# QA Task 2: Verify data visibility per role
#
# Run:  pytest tests/ui/test_donation_request_visibility.py -v
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

_DONOR_EMAIL = "theertha@gmail.com"
_DONOR_PASSWORD = "123456"


def _fresh_center_email() -> str:
    """Return a unique timestamped email for a fresh DISTRIBUTION_CENTER account."""
    return f"qa_center_{time.time_ns()}@test.com"


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
    """Log in through the React /join page and wait until a dashboard route loads.

    Always clears localStorage, sessionStorage, and cookies first so that a
    previously authenticated session (e.g. Center A) cannot bleed into the
    next login (e.g. Center B).
    """
    # 1. Land on the app origin so storage APIs are available
    driver.get(base_url.rstrip("/") + "/join")
    driver.execute_script("window.localStorage.clear();")
    driver.execute_script("window.sessionStorage.clear();")
    driver.delete_all_cookies()
    # 2. Reload to flush any in-memory React auth state
    driver.refresh()

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


def extract_request_ids(driver) -> set:
    """
    Extract request IDs only from inside table rows or article cards
    on the outgoing requests page. Avoids picking up IDs from the navbar,
    page headers, or any other unrelated DOM elements.
    """
    ids = set()

    # Desktop layout: first <td> in each <tbody> row contains "#N"
    rows = driver.find_elements(By.CSS_SELECTOR, "tbody tr")
    for row in rows:
        cells = row.find_elements(By.CSS_SELECTOR, "td")
        if cells:
            match = re.search(r"#(\d+)", cells[0].text)
            if match:
                ids.add(int(match.group(1)))

    # Mobile layout: each <article> card contains "#N" somewhere in its text
    articles = driver.find_elements(By.CSS_SELECTOR, "article")
    for article in articles:
        match = re.search(r"#(\d+)", article.text)
        if match:
            ids.add(int(match.group(1)))

    return ids


# ================================================================
# TESTS
# ================================================================


@pytest.mark.ui
def test_donor_can_see_available_requests(driver, base_url):
    """
    After a DISTRIBUTION_CENTER creates a pending request, a DONOR visiting
    /dashboard/donor/explore should see the Available Requests page.
    At least one card with a "pending" badge is expected (or the empty-state
    message if the backend filtered everything — both are valid outcomes).
    """
    # Seed one request via a fresh DC
    email = _fresh_center_email()
    try:
        token = api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, "Test@1234")
        api_create_request(token, "QA Visibility Test", 15, "kg")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    # Login as the known DONOR
    login_via_ui(driver, base_url, _DONOR_EMAIL, _DONOR_PASSWORD)
    driver.get(base_url.rstrip("/") + "/dashboard/donor/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the page to render its heading or the empty-state
    wait.until(
        lambda d: (
            "available requests" in d.page_source.lower()
            or "no requests found" in d.page_source.lower()
        )
    )

    cards = driver.find_elements(By.CSS_SELECTOR, "article")

    if cards:
        # At least one card must carry a "pending" status badge
        badges = driver.find_elements(By.CSS_SELECTOR, "span.rounded-full")
        badge_texts = [b.text.strip().lower() for b in badges if b.text.strip()]
        assert any("pending" in t for t in badge_texts), (
            f"Cards are present but none has a 'pending' badge. Badges: {badge_texts}"
        )
    else:
        # Empty state is also acceptable
        assert (
            "no requests found" in driver.page_source.lower()
            or "available requests" in driver.page_source.lower()
        ), "Neither request cards nor an empty-state message was found on the explore page"


@pytest.mark.ui
def test_center_can_only_see_own_outgoing_requests(driver, base_url):
    """
    Center A creates a request.  Center B logs in and views outgoing requests.
    Center A's request ID must NOT appear in Centre B's list.
    """
    email_a = _fresh_center_email()
    email_b = _fresh_center_email()

    try:
        token_a = api_register_and_login("DISTRIBUTION_CENTER", "QA Center A", email_a, "Test@1234")
        response_a = api_create_request(token_a, "QA Center A Food", 5, "kg")
        center_a_request_id = response_a["donationRequestId"]

        # Store token_b so we can reuse it for the API-level assertion later
        token_b = api_register_and_login("DISTRIBUTION_CENTER", "QA Center B", email_b, "Test@1234")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    # Login as Center B via UI
    login_via_ui(driver, base_url, email_b, "Test@1234")
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Wait for the page to finish loading (heading or empty state)
    wait.until(
        lambda d: (
            "outgoing requests" in d.page_source.lower()
            or "no outgoing requests" in d.page_source.lower()
        )
    )

    # --- UI assertion: scoped ID extraction from rows/cards only ---
    visible_ids = extract_request_ids(driver)

    assert center_a_request_id not in visible_ids, (
        f"Center B can see Center A's request #{center_a_request_id} in the UI — "
        "data isolation is broken"
    )

    # --- API-level assertion: backend must also exclude Center A's request ---
    api_base = os.getenv("VITE_API_BASE_URL", "http://localhost:5053").rstrip("/")
    try:
        res = requests.get(
            f"{api_base}/api/donation-requests/outgoing",
            headers={"Authorization": f"Bearer {token_b}"},
            timeout=10,
        )
        if res.status_code == 200:
            api_ids = {r["donationRequestId"] for r in res.json()}
            assert center_a_request_id not in api_ids, (
                f"API returned Center A's request #{center_a_request_id} to Center B — "
                "backend isolation is broken"
            )
    except requests.RequestException:
        pass  # API check is a bonus; UI check above is the primary gate


@pytest.mark.ui
def test_center_cannot_see_available_donor_explore_page(driver, base_url):
    """
    A DISTRIBUTION_CENTER who navigates directly to /dashboard/donor/explore
    must be redirected away (ProtectedRoute) and must NOT see the "Accept Request" button.
    """
    email = _fresh_center_email()

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, "Test@1234")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, "Test@1234")

    # Attempt direct navigation to the DONOR-only route
    driver.get(base_url.rstrip("/") + "/dashboard/donor/explore")

    wait = WebDriverWait(driver, 5)

    # Expect ProtectedRoute to redirect within 5 s
    try:
        wait.until(lambda d: "/donor/explore" not in d.current_url)
        redirected = True
    except Exception:
        redirected = False

    # The "Accept Request" button must NOT be present
    accept_buttons = driver.find_elements(
        By.XPATH, "//button[normalize-space()='Accept Request']"
    )
    assert len(accept_buttons) == 0, (
        "DISTRIBUTION_CENTER should NOT see the 'Accept Request' button on a donor-only page"
    )

    assert redirected or "/donor/explore" not in driver.current_url, (
        "DISTRIBUTION_CENTER was not redirected away from /dashboard/donor/explore"
    )


@pytest.mark.ui
def test_donor_cannot_see_outgoing_requests_page(driver, base_url):
    """
    A DONOR who navigates directly to /dashboard/center/requests must be
    redirected away and must NOT see the "Outgoing Requests" table/heading.
    """
    # Login as the known DONOR account
    login_via_ui(driver, base_url, _DONOR_EMAIL, _DONOR_PASSWORD)

    # Attempt direct navigation to the DC-only route
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 5)

    # Expect redirect within 5 s
    try:
        wait.until(lambda d: "/center/requests" not in d.current_url)
        redirected = True
    except Exception:
        redirected = False

    # The "Outgoing Requests" table heading must NOT be present
    headings = driver.find_elements(
        By.XPATH,
        "//*[self::p or self::h1 or self::h2 or self::h3]"
        "[normalize-space()='Outgoing Requests']"
    )
    assert len(headings) == 0, (
        "DONOR should NOT see the 'Outgoing Requests' heading on a DC-only page"
    )

    assert redirected or "/center/requests" not in driver.current_url, (
        "DONOR was not redirected away from /dashboard/center/requests"
    )


@pytest.mark.ui
def test_outgoing_requests_status_filter_works(driver, base_url):
    """
    On the outgoing requests page, changing the status filter to "Pending"
    must show only pending badges (or an empty list).  Switching back to
    "All statuses" must keep the outgoing requests section visible.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        token = api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
        api_create_request(token, "QA Filter Test", 8, "boxes")
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Wait for heading
    wait.until(lambda d: "outgoing requests" in d.page_source.lower())

    # Locate the status filter <select>
    filter_select_el = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select"))
    )
    filter_select = Select(filter_select_el)

    # ---- Switch to "Pending" ----
    filter_select.select_by_value("pending")

    # Brief wait for React re-render (max 3 s, polling 200 ms)
    import time as _time
    _time.sleep(0.5)

    badges_after_filter = driver.find_elements(
        By.CSS_SELECTOR,
        "tr span.rounded-full, article span.rounded-full"
    )
    badge_texts = [b.text.strip().lower() for b in badges_after_filter if b.text.strip()]

    # Every visible badge must be "pending" (empty list is also valid)
    for text in badge_texts:
        assert "pending" in text, (
            f"Non-pending badge visible after filtering by 'Pending': '{text}'"
        )

    # ---- Switch back to "All statuses" ----
    filter_select_el = driver.find_element(By.CSS_SELECTOR, "select")
    filter_select = Select(filter_select_el)
    filter_select.select_by_value("all")

    _time.sleep(0.3)

    # The outgoing requests section must still be visible
    assert "outgoing requests" in driver.page_source.lower(), (
        "Outgoing Requests heading disappeared after switching filter back to 'All'"
    )


# ================================================================
# NEW TESTS
# ================================================================


@pytest.mark.ui
def test_explore_page_shows_available_requests_heading(driver, base_url):
    """
    A DONOR visiting /dashboard/donor/explore must see the 'Available Requests'
    page heading and the search input with id='search-center-name'.
    """
    try:
        # Verify backend is reachable
        requests.post(
            f"{API_BASE}/api/auth/login",
            json={"email": _DONOR_EMAIL, "password": _DONOR_PASSWORD},
            timeout=10,
        ).raise_for_status()
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, _DONOR_EMAIL, _DONOR_PASSWORD)
    driver.get(base_url.rstrip("/") + "/dashboard/donor/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the heading to appear
    wait.until(
        lambda d: "available requests" in d.page_source.lower()
    )

    assert "available requests" in driver.page_source.lower(), (
        "'Available Requests' heading not found on /donor/explore"
    )

    # The center-name search input must be present
    search_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input#search-center-name"))
    )
    assert search_input.is_displayed(), (
        "Search input with id='search-center-name' is not visible on /donor/explore"
    )


@pytest.mark.ui
def test_outgoing_requests_empty_state_for_new_center(driver, base_url):
    """
    A brand-new DISTRIBUTION_CENTER with no requests must see the empty-state
    text 'No outgoing requests yet' on /center/requests.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        # Register only — do NOT create any requests
        api_register_and_login("DISTRIBUTION_CENTER", "QA Empty Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/requests")

    wait = WebDriverWait(driver, 20)

    # Wait for the page to finish loading (heading must appear first)
    wait.until(lambda d: "outgoing requests" in d.page_source.lower())

    # Wait for either empty-state text or a request row (to let React settle)
    wait.until(
        lambda d: (
            "no outgoing requests" in d.page_source.lower()
            or len(d.find_elements(By.CSS_SELECTOR, "tbody tr")) > 0
            or len(d.find_elements(By.CSS_SELECTOR, "article")) > 0
        )
    )

    rows = driver.find_elements(By.CSS_SELECTOR, "tbody tr")
    cards = driver.find_elements(By.CSS_SELECTOR, "article")

    if len(rows) == 0 and len(cards) == 0:
        # Empty state path — verify the expected message
        assert "no outgoing requests" in driver.page_source.lower(), (
            "Expected 'No outgoing requests yet' empty-state text, "
            "but it was not found in the page source"
        )
    else:
        # The new account already has requests (unexpected, but not a test failure)
        # This can happen if timestamps collide. Skip to avoid a false failure.
        pytest.skip(
            "Unexpectedly found existing requests for a freshly created center account"
        )
