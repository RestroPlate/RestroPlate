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


def test_edit_delete_buttons_visible(driver, base_url, seed_donations):

    login_as_donor(driver, base_url)

    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    found_action_buttons = False

    for card in cards:
        edit_buttons = card.find_elements(
            By.XPATH, ".//button[contains(., 'Edit')]"
        )

        delete_buttons = card.find_elements(
            By.XPATH, ".//button[contains(., 'Delete')]"
        )

        if edit_buttons or delete_buttons:
            found_action_buttons = True
            break

    assert found_action_buttons or len(cards) == 0


def test_requested_donation_cannot_be_modified(driver, base_url, seed_donations):

    login_as_donor(driver, base_url)

    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    for card in cards:

        status = card.find_element(
            By.CSS_SELECTOR, "span.rounded-full"
        ).text.strip().upper()

        if status != "AVAILABLE":

            edit_buttons = card.find_elements(
                By.XPATH, ".//button[contains(., 'Edit')]"
            )

            delete_buttons = card.find_elements(
                By.XPATH, ".//button[contains(., 'Delete')]"
            )

            assert len(edit_buttons) == 0
            assert len(delete_buttons) == 0


# ================================================================
# NEW TESTS
# ================================================================


@pytest.mark.ui
def test_available_donation_has_edit_button(driver, base_url, seed_donations):
    """
    The first AVAILABLE donation card must contain an Edit button.
    Skips gracefully when no AVAILABLE card exists.
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    available_card = None
    for card in cards:
        badge = card.find_elements(By.CSS_SELECTOR, "span.rounded-full")
        if badge and badge[0].text.strip().upper() == "AVAILABLE":
            available_card = card
            break

    if available_card is None:
        pytest.skip("No AVAILABLE donation found")

    edit_buttons = available_card.find_elements(
        By.XPATH, ".//button[contains(., 'Edit')]"
    )

    assert len(edit_buttons) > 0, (
        "Expected an 'Edit' button on the AVAILABLE donation card, but none was found"
    )


@pytest.mark.ui
def test_non_available_donation_has_no_delete_button(driver, base_url, seed_donations):
    """
    Any card whose status is NOT AVAILABLE must NOT have a Delete button.
    Skips gracefully when all cards happen to be AVAILABLE.
    """
    login_as_donor(driver, base_url)
    open_donation_page(driver, base_url)

    cards = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "section.space-y-3 article")
        )
    )

    non_available_card = None
    for card in cards:
        badge = card.find_elements(By.CSS_SELECTOR, "span.rounded-full")
        if badge and badge[0].text.strip().upper() != "AVAILABLE":
            non_available_card = card
            break

    if non_available_card is None:
        pytest.skip("All donations are AVAILABLE")

    delete_buttons = non_available_card.find_elements(
        By.XPATH, ".//button[contains(., 'Delete')]"
    )

    assert len(delete_buttons) == 0, (
        f"Non-AVAILABLE card should NOT have a 'Delete' button, "
        f"but {len(delete_buttons)} found"
    )