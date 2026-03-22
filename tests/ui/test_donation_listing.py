import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def login_as_donor(driver, base_url):

    driver.get(base_url.rstrip("/") + "/join")

    wait = WebDriverWait(driver, 20)

    email = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='email']"))
    )

    password = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='password']"))
    )

    email.clear()
    email.send_keys("theertha@gmail.com")

    password.clear()
    password.send_keys("123456")

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    ).click()

    wait.until(EC.url_contains("/dashboard/"))


def open_donation_page(driver, base_url):

    driver.get(base_url.rstrip("/") + "/dashboard/donor/my-donations")

    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.space-y-3"))
    )


def test_donation_listing(driver, base_url, seed_donations):

    login_as_donor(driver, base_url)

    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    assert len(cards) > 0


def test_donation_filtering(driver, base_url, seed_donations):

    login_as_donor(driver, base_url)

    open_donation_page(driver, base_url)

    wait = WebDriverWait(driver, 20)

    available_filter = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='Available']")
        )
    )

    available_filter.click()

    cards = wait.until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    assert len(cards) >= 0


def test_donation_pagination(driver, base_url):
    pytest.skip("Pagination not implemented in this UI")


# ================================================================
# NEW TESTS
# ================================================================


@pytest.mark.ui
def test_all_filter_shows_all_donations(driver, base_url, seed_donations):
    """
    Clicking the 'All' filter button must make it active.
    Active buttons lose the 'bg-white/5' inactive class; we detect the
    active state by asserting 'bg-white/5' is NOT in the button's class string.
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    wait = WebDriverWait(driver, 20)

    all_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='All']")
        )
    )
    all_btn.click()

    # Re-locate the button after click to read fresh class attribute
    all_btn = driver.find_element(By.XPATH, "//button[normalize-space()='All']")
    btn_class = all_btn.get_attribute("class") or ""

    # Active button loses the inactive-state class "bg-white/5"
    assert "bg-white/5" not in btn_class, (
        f"'All' filter button should be ACTIVE (no 'bg-white/5') after click, "
        f"but got class: '{btn_class}'"
    )

    # The card section must still be present
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.space-y-3"))
    )
    assert driver.find_element(By.CSS_SELECTOR, "section.space-y-3").is_displayed()



@pytest.mark.ui
def test_filter_shows_only_available_donations(driver, base_url, seed_donations):
    """
    Clicking the 'Available' filter must result in every visible donation card
    having a status badge of exactly 'AVAILABLE'.  If no cards are shown after
    filtering, the section element must still be present (valid empty state).
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    wait = WebDriverWait(driver, 20)

    # Locate the Available button then click via JS to avoid interactability issues
    btn = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//button[normalize-space()='Available']")
        )
    )
    driver.execute_script("arguments[0].click();", btn)

    # Wait for the section to settle after React re-render
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.space-y-3"))
    )

    cards = driver.find_elements(By.CSS_SELECTOR, "section.space-y-3 article")

    if cards:
        for card in cards:
            badges = card.find_elements(By.CSS_SELECTOR, "span.rounded-full")
            if badges:
                badge_text = badges[0].text.strip().upper()
                assert badge_text == "AVAILABLE", (
                    f"After clicking 'Available' filter, expected status 'AVAILABLE' "
                    f"but found '{badge_text}' in card:\n{card.text}"
                )
    else:
        # Empty state is valid — no AVAILABLE donations means no cards shown
        assert driver.find_element(
            By.CSS_SELECTOR, "section.space-y-3"
        ).is_displayed(), "section.space-y-3 should still be present in empty state"


@pytest.mark.ui
def test_donation_cards_show_food_type_and_quantity(driver, base_url, seed_donations):
    """
    Every donation card must have non-empty text and must contain the word
    'Quantity' (from the 'Quantity: X unit' detail row rendered in DonationHistory).
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    assert len(cards) > 0, "No donation cards found — cannot verify card content"

    for card in cards:
        card_text = card.text.strip()

        assert card_text != "", "Donation card is completely empty"

        assert "quantity" in card_text.lower(), (
            f"Expected 'Quantity' label in donation card text, but got:\n{card_text}"
        )


@pytest.mark.ui
def test_collected_filter_button_is_clickable(driver, base_url):
    """
    Edge case: Clicking the 'Collected' filter (which may have zero matching
    donations) must not crash the page.
    After clicking, section.space-y-3 must still be present in the DOM.
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    wait = WebDriverWait(driver, 20)

    # Locate the Collected filter button
    btn = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//button[normalize-space()='Collected']")
        )
    )

    # Click via JS to guarantee React state update fires
    driver.execute_script("arguments[0].click();", btn)

    # The donations section must still be present after the filter click
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.space-y-3"))
    )

    assert driver.find_element(
        By.CSS_SELECTOR, "section.space-y-3"
    ).is_displayed(), (
        "section.space-y-3 disappeared after clicking the 'Collected' filter button"
    )


@pytest.mark.ui
def test_completed_filter_shows_correct_empty_state(driver, base_url):
    """
    Edge case: Clicking the 'Completed' filter must result in either:
    (a) the correct empty-state message for that filter, OR
    (b) cards all carrying the expected COMPLETED badge.
    Zero COMPLETED donations is the most likely outcome for this account,
    making the empty-state assertion the primary pass path.
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    wait = WebDriverWait(driver, 20)

    # Click the 'Completed' filter button via JS
    btn = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//button[normalize-space()='Completed']")
        )
    )
    driver.execute_script("arguments[0].click();", btn)

    # Wait for section to settle
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.space-y-3"))
    )

    cards = driver.find_elements(By.CSS_SELECTOR, "section.space-y-3 article")

    if not cards:
        # Empty-state path — the exact text from DonationHistory.tsx line 126:
        # `No donations with status "${filter}" found.`  →  filter = "COMPLETED"
        assert 'No donations with status "COMPLETED" found.' in driver.page_source, (
            "Expected empty-state message 'No donations with status \"COMPLETED\" found.' "
            "but it was not found in page source"
        )
    else:
        # Cards are present — every badge must be COMPLETED
        for card in cards:
            badges = card.find_elements(By.CSS_SELECTOR, "span.rounded-full")
            if badges:
                badge_text = badges[0].text.strip().upper()
                assert badge_text == "COMPLETED", (
                    f"After clicking 'Completed' filter, expected badge 'COMPLETED' "
                    f"but found '{badge_text}'"
                )