import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def base_url():
    return os.getenv("BASE_URL", "http://localhost:5173/RestroPlate").rstrip("/")


@pytest.fixture(scope="session")
def chrome_service():
    """
    Install chromedriver only once per test session.
    Prevents driver crashes caused by repeated installations.
    """
    return Service(ChromeDriverManager().install())


@pytest.fixture
def driver(chrome_service):
    options = Options()
    options.add_argument("--start-maximized")

    # Stability improvements
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")

    if os.getenv("HEADLESS", "0") == "1":
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1440,900")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(
        service=chrome_service,
        options=options,
    )

    # implicitly_wait REMOVED — it interferes with WebDriverWait explicit waits
    # and causes unpredictable timing behaviour

    yield driver

    try:
        driver.quit()
    except Exception:
        pass