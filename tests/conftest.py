"""
RestroPlate E2E Test Configuration

Key design decisions:
1. setup_test_accounts() is a session-scoped autouse fixture.
   It calls POST /api/auth/register for both test accounts before any test runs.
   It ignores HTTP 409 (account already exists). This is idempotent.

2. login_as_donor / login_as_center are function-scoped fixtures.
   They call POST /api/auth/login via the `requests` library to get a real JWT,
   then inject it directly into localStorage. This is faster and more reliable
   than typing through the UI login form, which is subject to network timing issues.

3. The 'driver' fixture is function-scoped — a fresh browser per test.

4. base_url always includes the Vite base path /RestroPlate.

5. Uses Selenium 4's BUILT-IN Selenium Manager for driver downloads.
   Do NOT use webdriver-manager — it resolves to THIRD_PARTY_NOTICES.chromedriver
   on Windows with Chrome 147+, causing WinError 193.
"""
import os
import time
import requests as req_lib
import pytest
from dotenv import load_dotenv
from selenium import webdriver

load_dotenv(dotenv_path="tests/.env.test")

BASE_URL     = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173/RestroPlate")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5053")
HEADLESS     = os.getenv("HEADLESS", "false").lower() == "true"

DONOR_EMAIL    = os.getenv("DONOR_EMAIL", "test_donor@restroplate.io")
DONOR_PASSWORD = os.getenv("DONOR_PASSWORD", "TestDonor@123")
CENTER_EMAIL    = os.getenv("CENTER_EMAIL", "test_center@restroplate.io")
CENTER_PASSWORD = os.getenv("CENTER_PASSWORD", "TestCenter@123")


def pytest_addoption(parser):
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser: chrome | firefox | safari",
    )


@pytest.fixture(scope="session")
def browser_name(request):
    return request.config.getoption("--browser").lower()


# ─── ACCOUNT SETUP ────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_test_accounts():
    """
    Registers both test accounts via the API before the test session begins.
    Silently ignores 409 Conflict (account already exists).
    This must run before any test that calls login_as_donor or login_as_center.
    """
    accounts = [
        {
            "name": "Test Donor User",
            "email": DONOR_EMAIL,
            "password": DONOR_PASSWORD,
            "phoneNumber": "+94771234567",
            "address": "6.9271, 79.8612",
            "role": "DONOR",
        },
        {
            "name": "Test Distribution Center",
            "email": CENTER_EMAIL,
            "password": CENTER_PASSWORD,
            "phoneNumber": "+94771234568",
            "address": "6.9000, 79.8500",
            "role": "DISTRIBUTION_CENTER",
        },
    ]
    for account in accounts:
        try:
            response = req_lib.post(
                f"{API_BASE_URL}/api/auth/register",
                json=account,
                timeout=15,
            )
            if response.status_code not in (200, 201, 409):
                print(
                    f"[WARN] Registration returned {response.status_code} "
                    f"for {account['email']}: {response.text[:200]}"
                )
            else:
                print(f"[OK] Registration for {account['email']}: {response.status_code}")
        except Exception as exc:
            print(f"[WARN] Could not reach API to register {account['email']}: {exc}")
    yield


def _api_login(email: str, password: str) -> dict:
    """
    Returns {"token": str, "userId": int, "email": str, "role": str}
    or raises RuntimeError on failure.
    """
    try:
        r = req_lib.post(
            f"{API_BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()
    except Exception as exc:
        raise RuntimeError(
            f"API login failed for {email}: {exc}"
        ) from exc


def _inject_session(driver, data: dict, base_url: str) -> None:
    """
    Navigates to the app root (so localStorage is scoped to the right origin),
    then injects the JWT token and user object into localStorage.
    After this, any protected route navigation will succeed because React's
    ProtectedRoute reads from localStorage.
    """
    driver.get(base_url)
    time.sleep(0.5)  # let the page load so localStorage is accessible
    token = data.get("token", "")
    user_json = (
        f'{{"userId":{data.get("userId", 0)},'
        f'"email":"{data.get("email", "")}",'
        f'"role":"{data.get("role", "")}"}}'
    )
    driver.execute_script(
        "window.localStorage.setItem('restroplate_token', arguments[0]);"
        "window.localStorage.setItem('restroplate_user', arguments[1]);",
        token,
        user_json,
    )


# ─── DRIVER ───────────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def driver(browser_name):
    drv = _create_driver(browser_name)
    drv.set_window_size(1440, 900)
    drv.implicitly_wait(10)
    yield drv
    drv.quit()


def _create_driver(browser: str):
    """
    Creates a WebDriver using Selenium 4's built-in Selenium Manager.
    Do NOT use webdriver-manager — it breaks on Windows with Chrome 147+
    (resolves to THIRD_PARTY_NOTICES.chromedriver → WinError 193).
    """
    if browser == "chrome":
        options = webdriver.ChromeOptions()
        if HEADLESS:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--log-level=3")
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        return webdriver.Chrome(options=options)
    elif browser == "firefox":
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument("--headless")
        return webdriver.Firefox(options=options)
    else:
        raise ValueError(f"Unsupported browser: {browser}")


# ─── SESSION FIXTURES ─────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def base_url():
    return BASE_URL


@pytest.fixture(scope="function")
def donor_credentials():
    return {"email": DONOR_EMAIL, "password": DONOR_PASSWORD}


@pytest.fixture(scope="function")
def center_credentials():
    return {"email": CENTER_EMAIL, "password": CENTER_PASSWORD}


# ─── LOGIN HELPERS ────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def login_as_donor(driver, base_url, setup_test_accounts):
    """
    Injects a valid DONOR JWT into localStorage via API login.
    Use this instead of the UI login form for all tests that require authentication.
    Returns the dashboard URL so tests can assert navigation.
    """
    data = _api_login(DONOR_EMAIL, DONOR_PASSWORD)
    _inject_session(driver, data, base_url)
    driver.get(f"{base_url}/dashboard/donor")
    time.sleep(1)
    return f"{base_url}/dashboard/donor"


@pytest.fixture(scope="function")
def login_as_center(driver, base_url, setup_test_accounts):
    """
    Injects a valid DISTRIBUTION_CENTER JWT into localStorage via API login.
    Returns the dashboard URL so tests can assert navigation.
    """
    data = _api_login(CENTER_EMAIL, CENTER_PASSWORD)
    _inject_session(driver, data, base_url)
    driver.get(f"{base_url}/dashboard/center")
    time.sleep(1)
    return f"{base_url}/dashboard/center"
