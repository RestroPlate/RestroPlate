"""
Page Object for /join  (the Auth page).

Registration is a 2-step flow in RestroPlate:
  Step 1 — Select account type (type-card buttons: "Donator" | "Distributing Center")
  Step 2 — Fill in the registration form

Key selectors (verified against src/pages/Auth.tsx):
  - Tab buttons:         button.tab-btn  (text: 'LOGIN' / 'REGISTER')
  - Account type cards:  button.type-card  (contains span with 'Donator' / 'Distributing Center')
  - Form inputs:         input[name="email"], input[name="password"], etc.
  - Address field:       input[placeholder*="Lat, Lng"]
  - Submit button:       button[type="submit"].auth-submit
  - Success message:     div containing 'Account created successfully'
  - Error messages:      div with text-[#ff6b6b] class and rgba(255,80,80) border style
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class AuthPage(BasePage):
    PATH = "/join"

    # ── Locators ────────────────────────────────────────────────────────────
    TAB_LOGIN    = (By.XPATH, "//button[contains(@class,'tab-btn') and text()='LOGIN']")
    TAB_REGISTER = (By.XPATH, "//button[contains(@class,'tab-btn') and text()='REGISTER']")

    TYPE_DONOR  = (By.XPATH, "//button[contains(@class,'type-card')]//span[text()='Donator']/..")
    TYPE_CENTER = (By.XPATH, "//button[contains(@class,'type-card')]//span[text()='Distributing Center']/..")

    INPUT_EMAIL    = (By.CSS_SELECTOR, "input[name='email']")
    INPUT_PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
    INPUT_CONFIRM  = (By.CSS_SELECTOR, "input[name='confirmPassword']")
    INPUT_FULLNAME = (By.CSS_SELECTOR, "input[name='fullName']")
    INPUT_PHONE    = (By.CSS_SELECTOR, "input[name='phone']")
    # Auth.tsx: input type="text" placeholder="Manual Lat, Lng (e.g. 6.9271, 79.8612)"
    INPUT_ADDRESS  = (By.CSS_SELECTOR, "input[placeholder*='Lat, Lng']")

    BTN_SUBMIT  = (By.CSS_SELECTOR, "button[type='submit'].auth-submit")

    # Success message appears in login mode after successful registration
    # Auth.tsx line 227: {registrationSuccess} rendered inside a green div
    SUCCESS_MSG = (By.XPATH, "//*[contains(text(),'Account created successfully')]")

    # Error messages use text-[#ff6b6b] class with rgba(255,80,80) background
    ERROR_MSG   = (By.CSS_SELECTOR, "div.text-\\[\\#ff6b6b\\]")

    # ── Navigation ──────────────────────────────────────────────────────────
    def open(self):
        self.navigate_to(self.PATH)
        return self

    # ── Login flow ──────────────────────────────────────────────────────────
    def login(self, email: str, password: str):
        self.find_clickable(*self.TAB_LOGIN).click()
        email_input = self.find(*self.INPUT_EMAIL)
        email_input.clear()
        email_input.send_keys(email)
        pwd_input = self.find(*self.INPUT_PASSWORD)
        pwd_input.clear()
        pwd_input.send_keys(password)
        self.find_clickable(*self.BTN_SUBMIT).click()

    # ── Register flow ────────────────────────────────────────────────────────
    def start_registration(self, account_type: str):
        """account_type: 'DONOR' or 'DISTRIBUTION_CENTER'"""
        self.find_clickable(*self.TAB_REGISTER).click()
        if account_type == "DONOR":
            self.find_clickable(*self.TYPE_DONOR).click()
        else:
            self.find_clickable(*self.TYPE_CENTER).click()

    def fill_registration_form(self, full_name, email, password, phone,
                                address="6.9271, 79.8612"):
        self.find(*self.INPUT_FULLNAME).send_keys(full_name)
        self.find(*self.INPUT_EMAIL).send_keys(email)
        self.find(*self.INPUT_PASSWORD).send_keys(password)
        self.find(*self.INPUT_CONFIRM).send_keys(password)
        self.find(*self.INPUT_PHONE).send_keys(phone)
        addr_input = self.find(*self.INPUT_ADDRESS)
        addr_input.clear()
        addr_input.send_keys(address)

    def submit_registration(self):
        self.find_clickable(*self.BTN_SUBMIT).click()

    # ── Assertions ──────────────────────────────────────────────────────────
    def is_registration_successful(self) -> bool:
        try:
            self.find(*self.SUCCESS_MSG)
            return True
        except Exception:
            return False

    def get_error_message(self) -> str:
        return self.find(*self.ERROR_MSG).text
