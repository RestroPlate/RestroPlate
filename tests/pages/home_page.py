"""
Page Object for / (Home page — public consumer view)

Verified against src/pages/Home.tsx:
  Components rendered: NavBar, Hero, StatsBar, PublicMap, Mission,
  HowItWorks, PhotoStrip, Testimonials, CtaSection, Footer

The PublicMap component fetches from GET /api/public/centers-with-donations
and renders center cards and a map.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class HomePage(BasePage):
    PATH = "/"

    # NavBar / Hero branding
    BRANDING = (By.XPATH, "//*[contains(text(),'RestroPlate')]")

    # PublicMap container and elements
    MAP_CONTAINER        = (By.CSS_SELECTOR, "[class*='map'], [id*='map'], .leaflet-container, canvas")
    CENTER_CARDS         = (By.CSS_SELECTOR, "[class*='center-card'], [class*='CenterCard'], "
                                             "[class*='distribution'], [class*='dc-card']")
    CENTER_MODAL         = (By.CSS_SELECTOR, "[class*='modal'], [class*='Modal'], [role='dialog']")
    MODAL_CLOSE_BTN      = (By.XPATH, "//button[contains(text(),'Close') or @aria-label='Close']")

    # Sections that indicate public availability info
    AVAILABILITY_SECTION = (By.XPATH, "//*[contains(text(),'Available') or contains(text(),'Distribution') "
                                      "or contains(text(),'distribution')]")

    def open(self):
        self.navigate_to(self.PATH)
        return self

    def is_map_visible(self) -> bool:
        try:
            self.find(*self.MAP_CONTAINER)
            return True
        except Exception:
            return False

    def get_center_count(self) -> int:
        try:
            cards = self.driver.find_elements(*self.CENTER_CARDS)
            return len(cards)
        except Exception:
            return 0

    def click_first_center(self):
        cards = self.driver.find_elements(*self.CENTER_CARDS)
        if cards:
            cards[0].click()

    def is_center_details_modal_open(self) -> bool:
        try:
            self.find(*self.CENTER_MODAL)
            return True
        except Exception:
            return False

    def close_modal(self):
        try:
            self.find_clickable(*self.MODAL_CLOSE_BTN).click()
        except Exception:
            pass

    def has_branding(self) -> bool:
        elements = self.driver.find_elements(*self.BRANDING)
        return len(elements) > 0
