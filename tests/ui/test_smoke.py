from tests.ui.pages.base_page import BasePage

def test_homepage_loads(driver, base_url):
    page = BasePage(driver, base_url).open("/")
    assert "RestroPlate" in driver.page_source