"""
BasePage — shared helpers for all Page Object Model classes.
Provides wait utilities, navigation, screenshot capture.
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import os
import time

SCREENSHOT_DIR = "tests/reports/screenshots"


class BasePage:
    TIMEOUT = 15

    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, self.TIMEOUT)

    def navigate_to(self, path: str = ""):
        self.driver.get(f"{self.base_url}{path}")

    def find(self, by, value):
        return self.wait.until(EC.presence_of_element_located((by, value)))

    def find_clickable(self, by, value):
        return self.wait.until(EC.element_to_be_clickable((by, value)))

    def wait_for_url_contains(self, fragment: str, timeout: int = 15):
        WebDriverWait(self.driver, timeout).until(
            EC.url_contains(fragment)
        )

    def wait_for_text(self, by, value, text: str):
        return self.wait.until(
            EC.text_to_be_present_in_element((by, value), text)
        )

    def take_screenshot(self, name: str):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        path = os.path.join(SCREENSHOT_DIR, f"{name}_{int(time.time())}.png")
        self.driver.save_screenshot(path)
        return path
