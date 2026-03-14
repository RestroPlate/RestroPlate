import re
import time
from datetime import date, timedelta

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tests.ui.pages.auth_page import AuthPage


class DonorDashboardPage(AuthPage):

    CREATE_DONATION_HEADING = (
        By.XPATH,
        "//h3[contains(normalize-space(.), 'Create Donation Listing')]",
    )

    CREATE_DONATION_BUTTON = (
        By.XPATH,
        "//button[contains(normalize-space(.), 'CREATE DONATION')]",
    )

    FOOD_TYPE_INPUT         = (By.CSS_SELECTOR, "input[placeholder='Fresh bread']")
    QUANTITY_INPUT          = (By.CSS_SELECTOR, "input[placeholder='20']")
    UNIT_INPUT              = (By.CSS_SELECTOR, "input[placeholder='kg, servings, boxes']")
    EXPIRATION_DATE_INPUT   = (By.CSS_SELECTOR, "input[type='date']")
    PICKUP_ADDRESS_INPUT    = (By.CSS_SELECTOR, "input[placeholder='No. 12, Main Street, Colombo']")
    AVAILABILITY_TIME_INPUT = (By.CSS_SELECTOR, "input[type='time']")

    # ------------------------------------------------------------------ #
    #  Auth                                                                #
    # ------------------------------------------------------------------ #

    def login_as_donor(self, email="theertha@gmail.com", password="123456"):
        self.open_auth()
        self.login(email, password)

        WebDriverWait(self.driver, 15).until(EC.url_contains("/dashboard/donor"))
        WebDriverWait(self.driver, 15).until(
            EC.visibility_of_element_located(self.CREATE_DONATION_HEADING)
        )
        return self

    # ------------------------------------------------------------------ #
    #  Page text helpers                                                   #
    # ------------------------------------------------------------------ #

    def body_text(self):
        return self.driver.find_element(By.TAG_NAME, "body").text

    def body_text_lower(self):
        return self.body_text().lower()

    # ------------------------------------------------------------------ #
    #  Input helpers                                                       #
    # ------------------------------------------------------------------ #

    def _set_input(self, locator, value):
        """Standard text input: scroll, clear, type."""
        element = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(locator)
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", element
        )
        element.clear()
        element.send_keys(value)
        return element

    def _set_date_input(self, locator, iso_date: str):
        """
        Fill input[type='date'] cross-platform (fixes Windows + Chrome).

        On Windows, send_keys("YYYY-MM-DD") types literal characters instead
        of setting the date value. The only reliable fix is to set the value
        via the native JS setter and fire input+change events so React state
        updates correctly.

        iso_date must be "YYYY-MM-DD".
        """
        element = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(locator)
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", element
        )
        self.driver.execute_script(
            """
            var el = arguments[0];
            var val = arguments[1];
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(el, val);
            el.dispatchEvent(new Event('input',  {bubbles: true}));
            el.dispatchEvent(new Event('change', {bubbles: true}));
            """,
            element,
            iso_date,
        )
        return element

    def _set_time_input(self, locator, time_str: str):
        """
        Fill input[type='time'] cross-platform (fixes Windows + Chrome).

        Same Windows problem as date inputs. Uses JS native setter + event
        dispatch so React/Vue state picks up the value.

        time_str must be "HH:MM" (24-hour).
        """
        element = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(locator)
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", element
        )
        self.driver.execute_script(
            """
            var el = arguments[0];
            var val = arguments[1];
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(el, val);
            el.dispatchEvent(new Event('input',  {bubbles: true}));
            el.dispatchEvent(new Event('change', {bubbles: true}));
            """,
            element,
            time_str,
        )
        return element

    # ------------------------------------------------------------------ #
    #  Form actions                                                        #
    # ------------------------------------------------------------------ #

    def fill_donation_form(
        self,
        food_type,
        quantity,
        unit,
        expiration_date,
        pickup_address,
        availability_time,
    ):
        self._set_input(self.FOOD_TYPE_INPUT, food_type)
        self._set_input(self.QUANTITY_INPUT, quantity)
        self._set_input(self.UNIT_INPUT, unit)

        # JS-based setters fix the Windows + Chrome date/time input bug
        self._set_date_input(self.EXPIRATION_DATE_INPUT, expiration_date)
        self._set_time_input(self.AVAILABILITY_TIME_INPUT, availability_time)

        self._set_input(self.PICKUP_ADDRESS_INPUT, pickup_address)

        return self

    def submit_donation(self):
        button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable(self.CREATE_DONATION_BUTTON)
        )
        button.click()
        return self

    # ------------------------------------------------------------------ #
    #  Post-submit verification                                            #
    # ------------------------------------------------------------------ #

    def get_total_donations_count(self):
        text = self.body_text()

        # Primary: number on the same line as "Total Donations"
        match = re.search(r"Total Donations\s*(\d+)", text, re.IGNORECASE)
        if match:
            return int(match.group(1))

        # Fallback: number on the next few lines after "Total Donations"
        lines = text.splitlines()
        for i, line in enumerate(lines):
            if "total donations" in line.lower():
                for next_line in lines[i + 1:i + 5]:
                    if next_line.strip().isdigit():
                        return int(next_line.strip())

        return 0

    def wait_after_submit_and_check_success(self, food_name, before_count, timeout=25):
        # Wait until the button is clickable again = request has completed
        WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(self.CREATE_DONATION_BUTTON)
        )

        # Small buffer for the backend to persist the record
        time.sleep(2)

        # Reload so the new donation card renders
        self.driver.refresh()

        WebDriverWait(self.driver, 15).until(
            EC.visibility_of_element_located(self.CREATE_DONATION_HEADING)
        )

        after_count = self.get_total_donations_count()
        if after_count > before_count:
            return True

        if food_name.lower() in self.body_text_lower():
            return True

        return False

    # ------------------------------------------------------------------ #
    #  Assertion helpers                                                   #
    # ------------------------------------------------------------------ #

    def donation_card_present(self, food_name):
        return food_name.lower() in self.body_text_lower()

    def status_present(self, status):
        return status.lower() in self.body_text_lower()

    # ------------------------------------------------------------------ #
    #  Date utilities                                                      #
    # ------------------------------------------------------------------ #

    @staticmethod
    def tomorrow():
        return (date.today() + timedelta(days=1)).isoformat()

    @staticmethod
    def yesterday():
        return (date.today() - timedelta(days=1)).isoformat()