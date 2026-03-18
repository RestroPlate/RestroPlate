from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class DonorMyDonationsPage:

    URL = "/dashboard/donor/my-donations"

    # More flexible selectors
    DONATION_CONTAINER = (By.CSS_SELECTOR, "section.space-y-3")
    DONATION_CARDS = (By.CSS_SELECTOR, "section.space-y-3 article")

    STATUS_BADGE = (By.XPATH, ".//span[contains(@class, 'rounded-full')]")

    EDIT_BUTTON = (By.XPATH, ".//button[contains(., 'Edit')]")
    DELETE_BUTTON = (By.XPATH, ".//button[contains(., 'Delete')]")

    AVAILABLE_FILTER = (By.XPATH, "//button[normalize-space()='Available']")
    ALL_FILTER = (By.XPATH, "//button[normalize-space()='All']")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def open(self, base_url):
        self.driver.get(base_url.rstrip("/") + self.URL)

        # Wait for container
        self.wait.until(
            EC.presence_of_element_located(self.DONATION_CONTAINER)
        )

        # Wait for at least one card OR empty state
        self.wait.until(lambda d: 
            len(d.find_elements(*self.DONATION_CARDS)) >= 0
        )

    def get_cards(self):
        return self.wait.until(
            EC.presence_of_all_elements_located(self.DONATION_CARDS)
        )

    def has_cards(self):
        return len(self.driver.find_elements(*self.DONATION_CARDS)) > 0

    def filter_available(self):
        self.wait.until(
            EC.element_to_be_clickable(self.AVAILABLE_FILTER)
        ).click()

        # wait for UI update
        self.wait_for_cards_update()

    def filter_all(self):
        self.wait.until(
            EC.element_to_be_clickable(self.ALL_FILTER)
        ).click()

        # wait for UI update
        self.wait_for_cards_update()

    def wait_for_cards_update(self):
        """
        Small wait to allow React state update
        """
        self.wait.until(lambda d: True)  # minimal sync point

    def get_statuses(self):
        cards = self.driver.find_elements(*self.DONATION_CARDS)
        statuses = []

        for card in cards:
            badges = card.find_elements(*self.STATUS_BADGE)
            for b in badges:
                statuses.append(b.text.strip())

        return statuses

    def card_has_action_buttons(self, card):
        edit = card.find_elements(*self.EDIT_BUTTON)
        delete = card.find_elements(*self.DELETE_BUTTON)
        return len(edit) > 0 or len(delete) > 0