from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


class ExploreDonationsPage:

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 20)

    # =========================
    # NAVIGATION
    # =========================
    def open(self):
        self.wait.until(lambda d: "/dashboard" in d.current_url)

        elements = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'Browse') or contains(text(),'Donation')]"
        )

        if not elements:
            raise Exception("❌ Browse Donations button NOT FOUND")

        try:
            elements[0].click()
        except:
            self.driver.execute_script("arguments[0].click();", elements[0])

        self.wait.until(lambda d: "donation" in d.page_source.lower())

        return self

    # =========================
    # GET CARDS
    # =========================
    def get_cards(self):
        cards = self.driver.find_elements(By.XPATH, "//article")

        if not cards:
            cards = self.driver.find_elements(
                By.XPATH, "//div[contains(@class,'card')]"
            )

        return cards

    # =========================
    # SEARCH
    # =========================
    def search(self, text):
        inputs = self.driver.find_elements(By.XPATH, "//input")

        if not inputs:
            raise Exception("❌ No input field found")

        search_box = inputs[0]
        search_box.clear()
        search_box.send_keys(text)

        from selenium.webdriver.common.keys import Keys
        search_box.send_keys(Keys.ENTER)

        self.wait.until(lambda d: True)

        return self