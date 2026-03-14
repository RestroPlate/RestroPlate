from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, StaleElementReferenceException
from .base_page import BasePage


class AuthPage(BasePage):
    # Login locators
    EMAIL = (By.CSS_SELECTOR, "input[name='email']")
    PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

    def open_auth(self):
        # Your real route: /join
        return self.open("/join")

    # ---------- helpers ----------
    def wait_for(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def safe_click(self, locator, timeout=10):
        """
        Robust click:
        - wait presence
        - scroll into view (center)
        - wait clickable
        - normal click
        - fallback to JS click if intercepted / stale
        """
        el = WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

        # scroll to center (avoids fixed elements overlapping)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center', inline:'center'});", el
        )

        el = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )

        try:
            el.click()
        except (ElementClickInterceptedException, StaleElementReferenceException):
            el = self.driver.find_element(*locator)
            self.driver.execute_script("arguments[0].click();", el)

        return el

    def click_button_by_text(self, text, timeout=10):
        locator = (By.XPATH, f"//button[contains(normalize-space(.), '{text}')]")
        self.safe_click(locator, timeout=timeout)
        return self

    def set_input_by_name(self, name: str, value: str, timeout=10):
        locator = (By.CSS_SELECTOR, f"input[name='{name}']")
        el = self.wait_for(locator, timeout=timeout)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center', inline:'center'});", el
        )
        el.clear()
        el.send_keys(value)
        return self

    # ---------- tabs ----------
    def go_to_register_tab(self):
        # Tab button text is "REGISTER"
        self.click_button_by_text("REGISTER")
        return self

    def go_to_login_tab(self):
        """
        Switch back to LOGIN tab (needed for workflow: register -> login)
        """
        self.click_button_by_text("LOGIN")
        self.wait_for(self.EMAIL, timeout=10)  # make sure login form is visible
        return self

    # ---------- login ----------
    def login(self, email: str, password: str):
        self.set_input_by_name("email", email)
        self.set_input_by_name("password", password)
        self.safe_click(self.SUBMIT, timeout=10)
        return self

    # ---------- register flow ----------
    def choose_account_type(self, account_type: str):
        """
        account_type:
          - "Donator"
          - "Distributing Center"
        """
        self.click_button_by_text(account_type)
        return self

    def fill_register_form(
        self,
        full_name: str,
        email: str,
        password: str,
        confirm_password: str,
        phone: str,
        address: str,
    ):
        # These names match your Auth.tsx register form
        self.set_input_by_name("fullName", full_name)
        self.set_input_by_name("email", email)
        self.set_input_by_name("password", password)
        self.set_input_by_name("confirmPassword", confirm_password)
        self.set_input_by_name("phone", phone)
        self.set_input_by_name("address", address)
        return self

    def submit_register(self):
        # Button text: "CREATE ACCOUNT"
        self.click_button_by_text("CREATE ACCOUNT")
        return self

    def register_user(
        self,
        account_type: str,
        full_name: str,
        email: str,
        password: str,
        confirm_password: str,
        phone: str,
        address: str,
    ):
        self.go_to_register_tab()
        self.choose_account_type(account_type)
        self.fill_register_form(full_name, email, password, confirm_password, phone, address)
        self.submit_register()
        return self

    # ---------- NEW: workflow helper ----------
    def register_then_login(
        self,
        account_type: str,
        full_name: str,
        reg_email: str,
        reg_password: str,
        reg_confirm_password: str,
        phone: str,
        address: str,
        login_email: str,
        login_password: str,
    ):
        """
        Workflow:
        1) REGISTER -> choose type -> fill form -> click CREATE ACCOUNT
        2) LOGIN tab -> login
        Note: Register doesn't navigate yet (handleRegisterSubmit is TODO),
              so we just ensure click works, then proceed to login.
        """
        self.go_to_register_tab()
        self.choose_account_type(account_type)

        self.fill_register_form(
            full_name=full_name,
            email=reg_email,
            password=reg_password,
            confirm_password=reg_confirm_password,
            phone=phone,
            address=address,
        )

        self.submit_register()

        # Now switch to login and login
        self.go_to_login_tab()
        self.login(login_email, login_password)
        return self

    # ---------- assertions / utilities ----------
    def get_validation_message(self, input_name: str):
        el = self.driver.find_element(By.CSS_SELECTOR, f"input[name='{input_name}']")
        return el.get_attribute("validationMessage") or ""

    def current_path(self):
        return self.driver.current_url.lower()

    def body_text_lower(self):
        return self.driver.find_element(By.TAG_NAME, "body").text.lower()