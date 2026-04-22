"""
Page Object for /dashboard/donor/explore

Shows open donation requests from distribution centers.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class DonorExploreRequestsPage(BasePage):
    PATH = "/dashboard/donor/explore"

    PAGE_HEADING = (By.XPATH, "//*[contains(text(),'Request') or contains(text(),'request') or contains(text(),'Explore')]")
    REQUEST_CARDS = (By.CSS_SELECTOR, "[class*='card'], [class*='request'], tr")
    EMPTY_STATE = (By.XPATH, "//*[contains(text(),'No requests') or contains(text(),'no requests')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.wait_for_url_contains("/explore")
            return True
        except Exception:
            return False

    def has_requests_or_empty_state(self) -> bool:
        """Returns True if the page shows either request list or empty state."""
        content = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'request') or contains(text(),'Request') "
            "or contains(text(),'No requests')]"
        )
        return len(content) > 0
