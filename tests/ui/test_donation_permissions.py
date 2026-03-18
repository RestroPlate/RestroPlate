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