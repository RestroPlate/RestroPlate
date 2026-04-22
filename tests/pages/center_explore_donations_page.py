"""
Page Object for /dashboard/center/explore

Shows available donations for the distribution center to claim.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class CenterExploreDonationsPage(BasePage):
    PATH = "/dashboard/center/explore"

    PAGE_HEADING = (By.XPATH, "//*[contains(text(),'Donation') or contains(text(),'donation') or contains(text(),'Explore')]")
    DONATION_CARDS = (By.CSS_SELECTOR, "[class*='card'], [class*='donation'], tr")
    EMPTY_STATE = (By.XPATH, "//*[contains(text(),'No donations') or contains(text(),'no donations')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.wait_for_url_contains("/explore")
            return True
        except Exception:
            return False
