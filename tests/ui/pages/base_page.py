from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    def open(self, path=""):
        self.driver.get(f"{self.base_url}{path}")
        return self

    def wait_visible(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def wait_url_contains(self, text, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            lambda d: text in d.current_url
        )