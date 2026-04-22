"""
Page Object for /dashboard/donor/create

IMPORTANT — verified selectors from DonorCreateDonation.tsx source:
  - All inputs use 'id' attributes (NOT 'name')
  - id="foodType"        type="text"   placeholder="Fresh bread"
  - id="quantity"        type="number" placeholder="20"
  - id="unit"            type="text"   placeholder="kg, servings, boxes"
  - id="expirationDate"  type="date"
  - id="availabilityTime" type="time"  (NOT datetime-local — send "HH:MM" format)
  - pickup address: input.auth-input with placeholder containing "Lat, Lng"
  - submit: button[type="submit"] text "CREATE DONATION"

SUCCESS BEHAVIOUR:
  After successful submission, the component:
  1. Shows a StatusNotice with text "Donation listing created successfully!"
  2. After 1500ms setTimeout, navigates to /dashboard/donor/my-donations
  So is_submission_successful must wait up to ~5 seconds for the notice OR the URL change.
"""
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .base_page import BasePage


class DonorCreateDonationPage(BasePage):
    PATH = "/dashboard/donor/create"

    # Inputs — by id (confirmed from source)
    INPUT_FOOD_TYPE   = (By.ID, "foodType")
    INPUT_QUANTITY    = (By.ID, "quantity")
    INPUT_UNIT        = (By.ID, "unit")
    INPUT_EXPIRY      = (By.ID, "expirationDate")
    INPUT_AVAIL_TIME  = (By.ID, "availabilityTime")
    # Pickup address uses class auth-input and placeholder with "Lat"
    INPUT_ADDRESS     = (By.CSS_SELECTOR, "input.auth-input[placeholder*='Lat']")

    BTN_SUBMIT        = (By.CSS_SELECTOR, "button[type='submit']")

    # Success notice text rendered by StatusNotice component
    SUCCESS_TEXT      = (By.XPATH,
        "//*[contains(text(),'Donation listing created successfully')]"
        " | //*[contains(text(),'created successfully')]"
    )
    ERROR_TEXT        = (By.XPATH,
        "//*[contains(text(),'Please fix') or contains(@class,'rose')]"
    )

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def fill_donation_form(
        self,
        food_type: str,
        quantity: str,
        unit: str,
        expiry_date: str,
        pickup_address: str,
        availability_time: str,
    ):
        """
        expiry_date       → "YYYY-MM-DD"
        availability_time → "HH:MM"  (type="time", NOT datetime-local)
        pickup_address    → "lat, lng" e.g. "6.9271, 79.8612"
        """
        # Food Type
        el = self.find_clickable(*self.INPUT_FOOD_TYPE)
        el.clear()
        el.send_keys(food_type)

        # Quantity
        el = self.find_clickable(*self.INPUT_QUANTITY)
        el.clear()
        el.send_keys(quantity)

        # Unit
        el = self.find_clickable(*self.INPUT_UNIT)
        el.clear()
        el.send_keys(unit)

        # Expiration Date — React controlled input needs nativeInputValueSetter
        el = self.find(*self.INPUT_EXPIRY)
        self.driver.execute_script(
            "var nativeInputValueSetter = Object.getOwnPropertyDescriptor("
            "  window.HTMLInputElement.prototype, 'value').set;"
            "nativeInputValueSetter.call(arguments[0], arguments[1]);"
            "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
            el,
            expiry_date,
        )

        # Pickup Address
        addr_el = self.find_clickable(*self.INPUT_ADDRESS)
        addr_el.clear()
        addr_el.send_keys(pickup_address)
        # Allow React state update
        time.sleep(0.3)

        # Availability Time — React controlled input, same nativeInputValueSetter trick
        el = self.find(*self.INPUT_AVAIL_TIME)
        self.driver.execute_script(
            "var nativeInputValueSetter = Object.getOwnPropertyDescriptor("
            "  window.HTMLInputElement.prototype, 'value').set;"
            "nativeInputValueSetter.call(arguments[0], arguments[1]);"
            "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
            el,
            availability_time,
        )

    def submit(self):
        btn = self.find_clickable(*self.BTN_SUBMIT)
        self.driver.execute_script("arguments[0].click();", btn)

    def is_submission_successful(self) -> bool:
        """
        Returns True if either:
        - The success notice appears ("Donation listing created successfully!")
        - The URL redirects to /my-donations (happens after 1500ms setTimeout)
        Waits up to 8 seconds total.
        """
        deadline = time.time() + 8
        while time.time() < deadline:
            # Check for success notice
            els = self.driver.find_elements(*self.SUCCESS_TEXT)
            if els:
                return True
            # Check for URL redirect
            if "/my-donations" in self.driver.current_url:
                return True
            time.sleep(0.4)
        return False
