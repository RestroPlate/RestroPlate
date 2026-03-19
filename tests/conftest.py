import os
import time
import socket
import pytest
import requests

from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


# -----------------------------
# Base URL
# -----------------------------
@pytest.fixture(scope="session")
def base_url():
    return os.getenv("BASE_URL", "http://localhost:5173/RestroPlate")


# -----------------------------
# Helper: find a free port so each ChromeDriver gets its own
# -----------------------------
def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


# -----------------------------
# Helper: build Chrome options
# -----------------------------
def _chrome_options() -> Options:
    options = Options()
    options.add_argument("--headless=new")          # headless: no window, no GPU fight
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--remote-debugging-port=0")  # OS picks a free debug port
    return options


# -----------------------------
# Selenium Driver — PER FUNCTION with retry
# -----------------------------
@pytest.fixture(scope="function")
def driver():
    d = None
    last_error = None

    for attempt in range(3):          # retry up to 3 times
        try:
            service = Service(port=_free_port())   # unique port each attempt
            d = webdriver.Chrome(service=service, options=_chrome_options())
            d.set_page_load_timeout(30)
            d.implicitly_wait(0)       # keep explicit waits; don't mix with implicit
            break
        except Exception as exc:
            last_error = exc
            time.sleep(1.5 * (attempt + 1))   # back off before retry

    if d is None:
        pytest.fail(f"Could not start ChromeDriver after 3 attempts: {last_error}")

    yield d

    try:
        d.quit()
    except Exception:
        pass


# -----------------------------
# Seed Donations (API only — no browser needed)
# -----------------------------
@pytest.fixture(scope="session")
def seed_donations():
    api_base = os.getenv("VITE_API_BASE_URL", "http://localhost:5053").rstrip("/")

    login_url   = f"{api_base}/api/auth/login"
    donations_url = f"{api_base}/api/donations"

    login_payload = {
        "email": "theertha@gmail.com",
        "password": "123456",
    }

    try:
        login_res = requests.post(login_url, json=login_payload, timeout=10)
        login_res.raise_for_status()
    except Exception:
        pytest.skip("Backend not reachable → skipping donation seeding")

    token = login_res.json().get("token")
    if not token:
        pytest.skip("Could not retrieve API token")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    for i in range(3):
        donation_payload = {
            "foodType": f"QA Seed Donation {int(time.time())}-{i}",
            "quantity": 5,
            "unit": "Boxes",
            "expirationDate": (
                datetime.today() + timedelta(days=2)
            ).strftime("%Y-%m-%d"),
            "pickupAddress": "QA Test Location",
            "availabilityTime": "12:00",
        }
        try:
            requests.post(donations_url, json=donation_payload,
                          headers=headers, timeout=10)
        except requests.RequestException:
            pass


# -----------------------------
# explore_page fixture
# Logs in as the known DONOR and navigates to /dashboard/donor/explore.
# Returns the driver object, already on the explore page.
# -----------------------------
@pytest.fixture(scope="function")
def explore_page(driver, base_url):
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    api_base = os.getenv("VITE_API_BASE_URL", "http://localhost:5053").rstrip("/")

    try:
        login_res = requests.post(
            f"{api_base}/api/auth/login",
            json={"email": "theertha@gmail.com", "password": "123456"},
            timeout=10,
        )
        login_res.raise_for_status()
    except Exception:
        pytest.skip("Backend not reachable — skipping explore_page fixture")

    # Clear any existing session before logging in
    driver.get(base_url.rstrip("/") + "/join")
    driver.execute_script("window.localStorage.clear();")
    driver.execute_script("window.sessionStorage.clear();")
    driver.delete_all_cookies()
    driver.refresh()

    wait = WebDriverWait(driver, 20)

    email_el = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='email']"))
    )
    password_el = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='password']"))
    )
    email_el.clear()
    email_el.send_keys("theertha@gmail.com")
    password_el.clear()
    password_el.send_keys("123456")

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    ).click()
    wait.until(EC.url_contains("/dashboard/"))

    driver.get(base_url.rstrip("/") + "/dashboard/donor/explore")
    wait.until(
        lambda d: (
            "available requests" in d.page_source.lower()
            or "no requests" in d.page_source.lower()
            or "donation" in d.page_source.lower()
        )
    )

    return driver