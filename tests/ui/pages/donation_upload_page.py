import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .base_page import BasePage


class DonationUploadPage(BasePage):
    """
    Page Object Model for the DonorCreateDonation page
    Route: /dashboard/donor/create

    Maps directly to the real React component's HTML structure:
    - hidden <input type="file" accept=".jpg,.jpeg,.png" multiple>
    - "Add Photo" button triggers the hidden file input
    - validation error appears in a rose-colored div
    - image previews render inside a grid with <img alt="Preview">
    - "CREATE DONATION" submit button
    - success/error notices via <StatusNotice>
    """

    # ── Locators (mapped to DonorCreateDonation.tsx) ──────────────
    FILE_INPUT          = (By.CSS_SELECTOR, "input[type='file']")
    ADD_PHOTO_BTN       = (By.XPATH, "//button[normalize-space()='Add Photo']")
    SUBMIT_BTN          = (By.XPATH, "//button[normalize-space()='CREATE DONATION']")
    SUBMITTING_BTN      = (By.XPATH, "//button[normalize-space()='CREATING...']")
    PHOTO_PREVIEWS      = (By.CSS_SELECTOR, "img[alt='Preview']")
    UPLOAD_ERROR        = (By.CSS_SELECTOR, "div.text-rose-300")
    FOOD_TYPE_INPUT     = (By.CSS_SELECTOR, "input#foodType")
    QUANTITY_INPUT      = (By.CSS_SELECTOR, "input#quantity")
    UNIT_INPUT          = (By.CSS_SELECTOR, "input#unit")
    EXPIRATION_INPUT    = (By.CSS_SELECTOR, "input#expirationDate")
    AVAILABILITY_INPUT  = (By.CSS_SELECTOR, "input#availabilityTime")
    # StatusNotice success message
    SUCCESS_NOTICE      = (By.XPATH, "//*[contains(text(),'successfully')]")

    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
        self.wait = WebDriverWait(driver, 20)

    # ── Navigation ────────────────────────────────────────────────
    def open_create_donation(self):
        """Navigate to the donation creation page."""
        self.open("/dashboard/donor/create")
        self.wait.until(EC.presence_of_element_located(self.FILE_INPUT))
        return self

    # ── File Upload Actions ───────────────────────────────────────
    def upload_image(self, fixture_filename: str):
        """
        Send a file from tests/fixtures/ to the hidden file input.
        Selenium's send_keys on <input type=file> bypasses the OS dialog.
        """
        fixtures_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "fixtures")
        )
        file_path = os.path.join(fixtures_dir, fixture_filename)

        file_input = self.wait.until(
            EC.presence_of_element_located(self.FILE_INPUT)
        )
        file_input.send_keys(file_path)
        return self

    def get_preview_count(self) -> int:
        """Count the number of photo preview thumbnails currently shown."""
        return len(self.driver.find_elements(*self.PHOTO_PREVIEWS))

    def wait_for_preview(self, expected_count: int = 1, timeout: int = 10):
        """Wait until a certain number of preview images are visible."""
        WebDriverWait(self.driver, timeout).until(
            lambda d: len(d.find_elements(*self.PHOTO_PREVIEWS)) >= expected_count
        )
        return self

    # ── Error Detection ───────────────────────────────────────────
    def get_upload_error_text(self, timeout: int = 5) -> str:
        """Return the client-side validation error text (rose-colored div)."""
        try:
            el = WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(self.UPLOAD_ERROR)
            )
            return el.text.strip()
        except Exception:
            return ""

    def has_upload_error(self, timeout: int = 5) -> bool:
        """Check if a client-side validation error is visible."""
        return self.get_upload_error_text(timeout) != ""

    # ── Form Fill Helpers ─────────────────────────────────────────
    def fill_donation_form(
        self,
        food_type: str = "QA Test Bread",
        quantity: str = "10",
        unit: str = "kg",
        expiration_date: str = "",
        pickup_address: str = "6.9271, 79.8612",
        availability_time: str = "12:00",
    ):
        """Fill all required fields of the donation form."""
        from datetime import datetime, timedelta

        if not expiration_date:
            expiration_date = (datetime.today() + timedelta(days=2)).strftime("%Y-%m-%d")

        def fill_field(locator, value):
            el = self.wait.until(EC.element_to_be_clickable(locator))
            el.clear()
            el.send_keys(value)

        fill_field(self.FOOD_TYPE_INPUT, food_type)
        fill_field(self.QUANTITY_INPUT, quantity)
        fill_field(self.UNIT_INPUT, unit)
        fill_field(self.EXPIRATION_INPUT, expiration_date)
        fill_field(self.AVAILABILITY_INPUT, availability_time)

        # Pickup address — the text input above the map
        pickup_input = self.wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "input[placeholder*='Lat']")
            )
        )
        pickup_input.clear()
        pickup_input.send_keys(pickup_address)

        return self

    # ── Submit ────────────────────────────────────────────────────
    def click_create_donation(self):
        """Click the CREATE DONATION submit button."""
        btn = self.wait.until(EC.element_to_be_clickable(self.SUBMIT_BTN))
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", btn
        )
        btn.click()
        return self

    def is_submitting(self) -> bool:
        """Check if the form is currently in submitting state."""
        return len(self.driver.find_elements(*self.SUBMITTING_BTN)) > 0

    # ── Success Detection ─────────────────────────────────────────
    def wait_for_success(self, timeout: int = 20) -> str:
        """Wait until the success notice appears and return its text."""
        el = WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(self.SUCCESS_NOTICE)
        )
        return el.text.strip()

    def wait_for_redirect_to_my_donations(self, timeout: int = 25):
        """Wait until the browser redirects to /dashboard/donor/my-donations."""
        WebDriverWait(self.driver, timeout).until(
            EC.url_contains("/dashboard/donor/my-donations")
        )
        return self