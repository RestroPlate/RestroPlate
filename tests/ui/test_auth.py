# import os
# from selenium.webdriver.common.by import By
# from tests.ui.pages.auth_page import AuthPage

# def test_login_validation(driver, base_url):
#     page = AuthPage(driver, base_url).open_auth()

#     driver.find_element(*page.SUBMIT).click()

#     email = driver.find_element(By.CSS_SELECTOR, "input[name='email']")
#     validation_message = email.get_attribute("validationMessage")

#     assert validation_message != ""

# def test_login_success(driver, base_url):
#     email = os.getenv("TEST_EMAIL", "donator@test.com")
#     password = os.getenv("TEST_PASSWORD", "123456")

#     page = AuthPage(driver, base_url).open_auth()
#     page.login(email, password)

#     assert "/dashboard/" in driver.current_url

import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from tests.ui.pages.auth_page import AuthPage


def test_login_validation(driver, base_url):
    page = AuthPage(driver, base_url).open_auth()
    driver.find_element(*page.SUBMIT).click()

    email = driver.find_element(By.CSS_SELECTOR, "input[name='email']")
    assert email.get_attribute("validationMessage") != ""


def test_login_success_donor(driver, base_url):
    # Valid mock credentials from mockAuth.ts
    email = os.getenv("TEST_EMAIL", "donor@restroplate.com")
    password = os.getenv("TEST_PASSWORD", "donor123")

    page = AuthPage(driver, base_url).open_auth()
    page.login(email, password)

    # Wait until URL changes (navigation happens after async mockLogin)
    WebDriverWait(driver, 10).until(lambda d: "/dashboard/" in d.current_url)

    assert "/dashboard/donor" in driver.current_url