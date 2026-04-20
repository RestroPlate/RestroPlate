"""
Page Object for /dashboard/center/create-request

VERIFIED selectors from CenterCreateRequest.tsx:
  - Food type:  input[type="text"][placeholder="e.g., Rice, Bread, Vegetables"]
                class "auth-input"
  - Quantity:   input[type="number"][placeholder="e.g., 50"]
                class "auth-input"
  - Unit:       input[type="text"][placeholder="e.g., kg, loaves, servings"]
                class "auth-input"
  - Submit btn: button[type="submit"] text "Submit Request"

SUCCESS BEHAVIOUR:
  Shows a green div containing "Request #<id> submitted with <status> status."
  Then after 2000ms navigates to /dashboard/center/requests.

ERROR BEHAVIOUR:
  Shows a rose-coloured div with text like
  "Enter a valid requested quantity greater than 0."
  or "Food type and unit are required."
"""
import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class CenterCreateRequestPage(BasePage):
    PATH = "/dashboard/center/create-request"

    # Inputs — by placeholder (no id or name attributes in source)
    INPUT_FOOD_TYPE = (By.CSS_SELECTOR,
        "input[type='text'][placeholder='e.g., Rice, Bread, Vegetables']")
    INPUT_QUANTITY  = (By.CSS_SELECTOR,
        "input[type='number'][placeholder='e.g., 50']")
    INPUT_UNIT      = (By.CSS_SELECTOR,
        "input[type='text'][placeholder='e.g., kg, loaves, servings']")
    BTN_SUBMIT      = (By.CSS_SELECTOR, "button[type='submit']")

    # Success: green div containing "Request #"
    SUCCESS_MSG     = (By.XPATH,
        "//div[contains(text(),'submitted') or contains(text(),'Request #')]")
    # Error: rose/red div
    ERROR_MSG       = (By.XPATH,
        "//div[contains(@class,'rose') or contains(text(),'valid') "
        "or contains(text(),'required')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def submit_request(self, food_type: str, quantity: str, unit: str):
        self.find_clickable(*self.INPUT_FOOD_TYPE).clear()
        self.find_clickable(*self.INPUT_FOOD_TYPE).send_keys(food_type)
        self.find_clickable(*self.INPUT_QUANTITY).clear()
        self.find_clickable(*self.INPUT_QUANTITY).send_keys(quantity)
        self.find_clickable(*self.INPUT_UNIT).clear()
        self.find_clickable(*self.INPUT_UNIT).send_keys(unit)
        self.find_clickable(*self.BTN_SUBMIT).click()

    def is_success(self) -> bool:
        """Waits up to 5 seconds for the success message or URL change."""
        deadline = time.time() + 5
        while time.time() < deadline:
            if self.driver.find_elements(*self.SUCCESS_MSG):
                return True
            if "/requests" in self.driver.current_url:
                return True
            time.sleep(0.3)
        return False

    def get_error_text(self) -> str:
        try:
            els = self.driver.find_elements(*self.ERROR_MSG)
            if els and els[0].text.strip():
                return els[0].text
            
            # Form might use HTML5 validation (e.g. min="0.01")
            qty = self.driver.find_element(*self.INPUT_QUANTITY)
            return qty.get_attribute("validationMessage") or ""
        except Exception:
            return ""
