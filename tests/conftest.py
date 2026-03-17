import pytest
import random
import tempfile

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

from webdriver_manager.chrome import ChromeDriverManager

from tests.ui.pages.auth_page import AuthPage
from tests.ui.pages.explore_page import ExploreDonationsPage


# =========================
# BASE URL
# =========================
@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:5173/RestroPlate"


# =========================
# DRIVER (🔥 FIXED - FUNCTION)
# =========================
@pytest.fixture(scope="function")
def driver():
    options = Options()

    options.add_argument("--start-maximized")
    options.add_argument("--remote-allow-origins=*")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")

    # 🔥 temp Chrome profile (CRITICAL FIX)
    temp_dir = tempfile.mkdtemp()
    options.add_argument(f"--user-data-dir={temp_dir}")

    service = Service(ChromeDriverManager().install())

    driver = webdriver.Chrome(service=service, options=options)

    yield driver

    # 🔥 safe quit (prevents session errors)
    try:
        driver.quit()
    except:
        pass


# =========================
# LOGGED-IN DRIVER
# =========================
@pytest.fixture(scope="function")
def logged_in_driver(driver, base_url):
    wait = WebDriverWait(driver, 20)

    # reset state
    driver.delete_all_cookies()
    driver.get(base_url)

    email = f"center{random.randint(1000,9999)}@test.com"
    password = "123456"

    auth = AuthPage(driver, base_url)

    # REGISTER
    auth.open_auth()
    auth.register_user(
        account_type="Distributing Center",
        full_name="Test Center",
        email=email,
        password=password,
        confirm_password=password,
        phone="0771234567",
        address="Colombo"
    )

    # LOGIN
    auth.go_to_login_tab()
    auth.login(email, password)

    wait.until(lambda d: "/dashboard" in d.current_url)

    return driver


# =========================
# EXPLORE PAGE
# =========================
@pytest.fixture(scope="function")
def explore_page(logged_in_driver):
    page = ExploreDonationsPage(logged_in_driver)
    page.open()
    return logged_in_driver