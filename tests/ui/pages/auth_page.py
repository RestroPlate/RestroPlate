# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from .base_page import BasePage

# class AuthPage(BasePage):
#     EMAIL = (By.CSS_SELECTOR, "input[name='email']")
#     PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
#     SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

#     def open_auth(self):
#         return self.open("/join")   # change to /login if your route differs

#     def login(self, email: str, password: str):
#         WebDriverWait(self.driver, 10).until(
#             EC.visibility_of_element_located(self.EMAIL)
#         ).send_keys(email)

#         self.driver.find_element(*self.PASSWORD).send_keys(password)
#         self.driver.find_element(*self.SUBMIT).click()

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .base_page import BasePage


class AuthPage(BasePage):
    EMAIL = (By.CSS_SELECTOR, "input[name='email']")
    PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

    def open_auth(self):
        return self.open("/join")

    def login(self, email: str, password: str):
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(self.EMAIL)
        )
        email_el = self.driver.find_element(*self.EMAIL)
        pwd_el = self.driver.find_element(*self.PASSWORD)

        email_el.clear()
        email_el.send_keys(email)

        pwd_el.clear()
        pwd_el.send_keys(password)

        self.driver.find_element(*self.SUBMIT).click()