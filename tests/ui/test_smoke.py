from selenium.webdriver.support.ui import WebDriverWait
from tests.ui.pages.auth_page import AuthPage


def test_register_then_login_workflow(driver, base_url):
    page = AuthPage(driver, base_url).open_auth()

    page.register_then_login(
        account_type="Donator",
        full_name="Test User",
        reg_email="testuser@gmail.com",
        reg_password="123456",
        reg_confirm_password="123456",
        phone="+94770000000",
        address="Colombo",
        login_email="testuser@gmail.com",
        login_password="123456",
    )

    WebDriverWait(driver, 10).until(lambda d: "/dashboard/" in d.current_url.lower())
    assert ("/dashboard/donor" in driver.current_url.lower()) or ("/dashboard/center" in driver.current_url.lower())