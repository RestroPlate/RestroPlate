"""
Page Object for /dashboard/donor/my-donations

Shows the donor's donation history list or empty state.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class DonorMyDonationsPage(BasePage):
    PATH = "/dashboard/donor/my-donations"

    PAGE_HEADING = (By.XPATH, "//*[contains(text(),'My Donations') or contains(text(),'Donation')]")
    DONATION_ROWS = (By.CSS_SELECTOR, "tr, [class*='donation'], [class*='card']")
    EMPTY_STATE = (By.XPATH, "//*[contains(text(),'No donations') or contains(text(),'no donations')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.wait_for_url_contains("/my-donations")
            return True
        except Exception:
            return False

    def has_donations_or_empty_state(self) -> bool:
        """Returns True if the page shows either donation list or empty state."""
        content = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'donation') or contains(text(),'Donation') "
            "or contains(text(),'No donations')]"
        )
        return len(content) > 0
