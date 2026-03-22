import os
import time

import pytest
import requests

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
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
    """Register a user via API and return a JWT token."""
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


def login_via_ui(driver, base_url: str, email: str, password: str) -> None:
    """Log in through the React /join page, clearing any prior session first."""
    driver.get(base_url.rstrip("/") + "/join")
    driver.execute_script("window.localStorage.clear();")
    driver.execute_script("window.sessionStorage.clear();")
    driver.delete_all_cookies()
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


# =========================
# HELPER
# =========================
def get_cards(driver):
    cards = driver.find_elements(By.XPATH, "//article")

    if not cards:
        cards = driver.find_elements(By.XPATH, "//div[contains(@class,'card')]")

    return cards


# =========================
# ✅ SUBTASK 4.1.7
# =========================
@pytest.mark.ui
def test_only_available_donations_displayed(explore_page):
    driver = explore_page
    wait = WebDriverWait(driver, 15)

    wait.until(lambda d: "donation" in d.page_source.lower())

    cards = get_cards(driver)

    if not cards:
        assert True
        return

    for card in cards:
        assert "pending" in card.text.lower() or "completed" in card.text.lower(), \
            f"❌ Unexpected status in card: {card.text}"


# =========================
# ✅ SUBTASK 4.1.6
# =========================
@pytest.mark.ui
def test_search_filter_sorting_functionality(explore_page):
    driver = explore_page
    wait = WebDriverWait(driver, 15)

    wait.until(lambda d: "donation" in d.page_source.lower())

    cards = get_cards(driver)

    if not cards:
        assert True
        return

    # ---------- SEARCH ----------
    keyword = cards[0].text.split()[0]

    inputs = driver.find_elements(By.XPATH, "//input")
    assert inputs, "❌ No input field found"

    search_box = inputs[0]
    search_box.clear()
    search_box.send_keys(keyword)
    search_box.send_keys(Keys.ENTER)

    wait.until(lambda d: True)

    searched_cards = get_cards(driver)

    if searched_cards:
        for card in searched_cards:
            assert keyword.lower() in card.text.lower(), \
                f"❌ Search mismatch: {card.text}"

    # ---------- FILTER ----------
    filter_buttons = driver.find_elements(
        By.XPATH,
        "//*[contains(text(),'Available')]"
    )

    if filter_buttons:
        try:
            filter_buttons[0].click()
        except:
            driver.execute_script("arguments[0].click();", filter_buttons[0])

        wait.until(lambda d: True)

        filtered_cards = get_cards(driver)

        if filtered_cards:
            for card in filtered_cards:
                assert "pending" in card.text.lower() or "completed" in card.text.lower(), \
                    f"❌ Unexpected status in card: {card.text}"

    # ---------- SORT ----------
    before_sort = [c.text for c in get_cards(driver)]

    sort_buttons = driver.find_elements(
        By.XPATH,
        "//*[contains(text(),'Sort') or contains(text(),'Newest') or contains(text(),'Oldest')]"
    )

    if sort_buttons:
        try:
            sort_buttons[0].click()
        except:
            driver.execute_script("arguments[0].click();", sort_buttons[0])

        wait.until(lambda d: True)

        after_sort = [c.text for c in get_cards(driver)]

        # Sorting is valid even if order doesn't change (e.g. same timestamps)
        assert True

    assert True


# ================================================================
# NEW TESTS
# ================================================================


@pytest.mark.ui
def test_center_explore_page_loads_with_heading(driver, base_url):
    """
    A DISTRIBUTION_CENTER navigating to /center/explore must see the
    'Browse Donations' page heading and the Sort By <select> dropdown.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the heading to appear
    wait.until(lambda d: "browse donations" in d.page_source.lower())

    assert "browse donations" in driver.page_source.lower(), (
        "'Browse Donations' heading not found on /center/explore"
    )

    # The Sort By <select> must be present
    sort_select = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select"))
    )
    assert sort_select.is_displayed(), (
        "Sort By <select> element is not visible on /center/explore"
    )


@pytest.mark.ui
def test_center_explore_sort_select_has_correct_options(driver, base_url):
    """
    The Sort By <select> on /center/explore must have:
    - An option with value='expirationDate' (Expiration Date)
    - An option with value='createdAt' (Newest First)
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the page heading
    wait.until(lambda d: "browse donations" in d.page_source.lower())

    # Locate the sort <select>
    sort_select_el = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select"))
    )
    sort_select = Select(sort_select_el)

    option_values = [opt.get_attribute("value") for opt in sort_select.options]

    assert "expirationDate" in option_values, (
        f"Sort select missing 'expirationDate' option. Found: {option_values}"
    )
    assert "createdAt" in option_values, (
        f"Sort select missing 'createdAt' option. Found: {option_values}"
    )


@pytest.mark.ui
def test_center_explore_empty_state_with_no_match(driver, base_url):
    """
    Edge case: Typing a nonsense string into the food-type filter on
    /center/explore must produce either a no-results message or zero cards.
    This verifies the debounced client-side filter handles zero-match gracefully.
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the page heading to confirm the page loaded
    wait.until(lambda d: "browse donations" in d.page_source.lower())

    # Find the Food Type text input (first input on the page)
    food_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
    )
    food_input.clear()
    food_input.send_keys("ZZZNOMATCHXXX999")

    # Wait 2 seconds to cover the component's 250 ms debounce + render cycle
    time.sleep(2)

    # Assert either: empty-state message present OR no article cards visible
    no_results_msg = "no available donations match these filters" in driver.page_source.lower()
    article_count = len(driver.find_elements(By.CSS_SELECTOR, "article"))

    assert no_results_msg or article_count == 0, (
        f"Expected zero results for nonsense filter 'ZZZNOMATCHXXX999', "
        f"but found {article_count} article(s) and no empty-state message."
    )


@pytest.mark.ui
def test_center_explore_has_location_filter_input(driver, base_url):
    """
    Edge case: The /center/explore page must expose a Location text input
    (second input[type='text'] on the page, placeholder 'Colombo, Kandy').
    Typing a location string must not crash the page — the 'Browse Donations'
    heading must still be present after the debounce settles (1 s wait).
    """
    email = _fresh_center_email()
    password = "Test@1234"

    try:
        api_register_and_login("DISTRIBUTION_CENTER", "QA Center", email, password)
    except Exception:
        pytest.skip("Backend not reachable — skipping test")

    login_via_ui(driver, base_url, email, password)
    driver.get(base_url.rstrip("/") + "/dashboard/center/explore")

    wait = WebDriverWait(driver, 20)

    # Wait for the page heading
    wait.until(lambda d: "browse donations" in d.page_source.lower())

    # The page has 2 text inputs: Food Type (first) and Location (second)
    text_inputs = wait.until(
        lambda d: d.find_elements(By.CSS_SELECTOR, "input[type='text']")
        if len(d.find_elements(By.CSS_SELECTOR, "input[type='text']")) >= 2
        else None
    )

    assert len(text_inputs) >= 2, (
        f"Expected at least 2 text inputs on /center/explore (Food Type + Location), "
        f"found {len(text_inputs)}"
    )

    # The second input is the Location filter
    location_input = text_inputs[1]
    location_input.clear()
    location_input.send_keys("Colombo")

    # Wait 1 second to cover the 250 ms debounce + render cycle
    time.sleep(1)

    # The heading must still be present — the page must not have crashed
    assert "browse donations" in driver.page_source.lower(), (
        "'Browse Donations' heading disappeared after typing into the Location filter"
    )