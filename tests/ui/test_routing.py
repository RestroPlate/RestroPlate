from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tests.ui.pages.auth_page import AuthPage


def test_home_page_loads(driver, base_url):
    """
    Smoke test: app loads and shows the brand somewhere.
    Works for both GitHub Pages + local dev.
    """
    driver.get(base_url + "/")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )

    body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
    assert "restroplate" in body_text


def test_join_page_loads(driver, base_url):
    """
    Smoke test: /join renders and login form is visible.
    """
    page = AuthPage(driver, base_url).open_auth()

    # Wait for email field (login form should be default)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='email']"))
    )

    assert "/join" in driver.current_url.lower()


def test_register_flow_opens(driver, base_url):
    """
    Smoke test: Register tab opens and account-type selection appears.
    (Donator / Distributing Center buttons exist)
    """
    page = AuthPage(driver, base_url).open_auth()
    page.go_to_register_tab()

    # Wait for account type button to exist (text-based)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Donator')]"))
    )

    # Verify both account type choices exist
    assert driver.find_element(By.XPATH, "//button[contains(., 'Donator')]")
    assert driver.find_element(By.XPATH, "//button[contains(., 'Distributing Center')]")