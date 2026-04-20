"""
Page Object for /dashboard/donor (Donor Dashboard overview).

This page shows the donor's dashboard home with navigation links
to create donations, view my donations, and explore requests.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class DonorDashboardPage(BasePage):
    PATH = "/dashboard/donor"

    HEADING = (By.XPATH, "//h2[contains(text(),'Dashboard') or contains(text(),'dashboard')]")
    NAV_CREATE = (By.XPATH, "//a[contains(@href,'/create') or contains(text(),'Create')]")
    NAV_MY_DONATIONS = (By.XPATH, "//a[contains(@href,'/my-donations') or contains(text(),'My Donations')]")
    NAV_EXPLORE = (By.XPATH, "//a[contains(@href,'/explore') or contains(text(),'Explore')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.wait_for_url_contains("/dashboard/donor")
            return True
        except Exception:
            return False

    def go_to_create_donation(self):
        self.find_clickable(*self.NAV_CREATE).click()

    def go_to_my_donations(self):
        self.find_clickable(*self.NAV_MY_DONATIONS).click()

    def go_to_explore_requests(self):
        self.find_clickable(*self.NAV_EXPLORE).click()
