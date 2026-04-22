"""
Page Object for /dashboard/center (Distribution Center Dashboard overview).
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class CenterDashboardPage(BasePage):
    PATH = "/dashboard/center"

    HEADING = (By.XPATH, "//h2[contains(text(),'Dashboard') or contains(text(),'dashboard')]")
    NAV_EXPLORE = (By.XPATH, "//a[contains(@href,'/explore') or contains(text(),'Explore')]")
    NAV_CREATE_REQUEST = (By.XPATH, "//a[contains(@href,'/create-request') or contains(text(),'Create Request')]")
    NAV_REQUESTS = (By.XPATH, "//a[contains(@href,'/requests') or contains(text(),'Requests')]")
    NAV_INVENTORY = (By.XPATH, "//a[contains(@href,'/inventory') or contains(text(),'Inventory')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.wait_for_url_contains("/dashboard/center")
            return True
        except Exception:
            return False
