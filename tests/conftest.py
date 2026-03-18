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