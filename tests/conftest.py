import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="session")
def base_url():
    """
    Base URL for RestroPlate frontend (GitHub Pages).
    Can be overridden by setting BASE_URL environment variable.
    """
    return os.getenv(
        "BASE_URL",
        "https://restroplate.github.io/RestroPlate"
    ).rstrip("/")


@pytest.fixture
def driver():
    """
    Selenium Chrome driver setup.
    Uses Selenium Manager (auto driver handling).
    Supports headless mode via HEADLESS=1.
    """

    options = Options()

    # Headless mode (for CI or silent runs)
    if os.getenv("HEADLESS", "0") == "1":
        options.add_argument("--headless=new")

    options.add_argument("--window-size=1280,800")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(2)

    yield driver

    driver.quit()