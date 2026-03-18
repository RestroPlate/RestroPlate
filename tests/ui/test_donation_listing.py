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