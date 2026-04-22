"""
Page Object for /dashboard/center/inventory

VERIFIED tab button texts from CenterInventory.tsx:
  - "Publish to Consumers"   (activeTab === "publish")
  - "Mark as Collected"      (activeTab === "collect") ← NOT "Collect Donation"
  - "Completed Donations"    (activeTab === "completed") ← NOT "Completed"
"""
import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class CenterInventoryPage(BasePage):
    PATH = "/dashboard/center/inventory"

    TAB_PUBLISH   = (By.XPATH, "//button[normalize-space()='Publish to Consumers']")
    TAB_COLLECT   = (By.XPATH, "//button[normalize-space()='Mark as Collected']")
    TAB_COMPLETED = (By.XPATH, "//button[normalize-space()='Completed Donations']")

    # Rows in whichever table is currently active
    TABLE_ROWS    = (By.CSS_SELECTOR, "tbody tr")

    # Published / unpublished toggle — look for any button inside table rows
    PUBLISH_BTN   = (By.XPATH,
        "//tbody//button[contains(@class,'toggle') or "
        "contains(text(),'Publish') or contains(text(),'publish') or "
        "contains(text(),'Unpublish')]"
    )

    # Heading text that proves the inventory page loaded
    PAGE_HEADING  = (By.XPATH,
        "//*[contains(text(),'Manage & Publish Inventory') or "
        "contains(text(),'Center Inventory')]"
    )

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_loaded(self) -> bool:
        try:
            self.find(*self.PAGE_HEADING)
            return True
        except Exception:
            return False

    def click_publish_tab(self):
        self.find_clickable(*self.TAB_PUBLISH).click()
        time.sleep(0.5)

    def click_collect_tab(self):
        self.find_clickable(*self.TAB_COLLECT).click()
        time.sleep(0.5)

    def click_completed_tab(self):
        self.find_clickable(*self.TAB_COMPLETED).click()
        time.sleep(0.5)

    def get_row_count(self) -> int:
        try:
            # Check for the empty state message first
            empty_msg = self.driver.find_elements(By.XPATH, "//td[contains(text(),'No collected') or contains(text(),'No published')]")
            if empty_msg:
                return 0
            return len(self.driver.find_elements(*self.TABLE_ROWS))
        except Exception:
            return 0

    def publish_first_item(self) -> bool:
        btns = self.driver.find_elements(*self.PUBLISH_BTN)
        if btns:
            btns[0].click()
            return True
        return False
