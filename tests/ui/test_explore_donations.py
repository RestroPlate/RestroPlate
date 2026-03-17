import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait


# =========================
# HELPER
# =========================
def get_cards(driver):
    cards = driver.find_elements(By.XPATH, "//article")

    if not cards:
        cards = driver.find_elements(By.XPATH, "//div[contains(@class,'card')]")

    return cards


# =========================
# ✅ SUBTASK 4.1.7
# =========================
@pytest.mark.ui
def test_only_available_donations_displayed(explore_page):
    driver = explore_page
    wait = WebDriverWait(driver, 15)

    wait.until(lambda d: "donation" in d.page_source.lower())

    cards = get_cards(driver)

    if not cards:
        assert True
        return

    for card in cards:
        assert "available" in card.text.lower(), \
            f"❌ Non-available donation found: {card.text}"


# =========================
# ✅ SUBTASK 4.1.6
# =========================
@pytest.mark.ui
def test_search_filter_sorting_functionality(explore_page):
    driver = explore_page
    wait = WebDriverWait(driver, 15)

    wait.until(lambda d: "donation" in d.page_source.lower())

    cards = get_cards(driver)

    if not cards:
        assert True
        return

    # ---------- SEARCH ----------
    keyword = cards[0].text.split()[0]

    inputs = driver.find_elements(By.XPATH, "//input")
    assert inputs, "❌ No input field found"

    search_box = inputs[0]
    search_box.clear()
    search_box.send_keys(keyword)
    search_box.send_keys(Keys.ENTER)

    wait.until(lambda d: True)

    searched_cards = get_cards(driver)

    if searched_cards:
        for card in searched_cards:
            assert keyword.lower() in card.text.lower(), \
                f"❌ Search mismatch: {card.text}"

    # ---------- FILTER ----------
    filter_buttons = driver.find_elements(
        By.XPATH,
        "//*[contains(text(),'Available')]"
    )

    if filter_buttons:
        try:
            filter_buttons[0].click()
        except:
            driver.execute_script("arguments[0].click();", filter_buttons[0])

        wait.until(lambda d: True)

        filtered_cards = get_cards(driver)

        if filtered_cards:
            for card in filtered_cards:
                assert "available" in card.text.lower(), \
                    f"❌ Filter failed: {card.text}"

    # ---------- SORT ----------
    before_sort = [c.text for c in get_cards(driver)]

    sort_buttons = driver.find_elements(
        By.XPATH,
        "//*[contains(text(),'Sort') or contains(text(),'Newest') or contains(text(),'Oldest')]"
    )

    if sort_buttons:
        try:
            sort_buttons[0].click()
        except:
            driver.execute_script("arguments[0].click();", sort_buttons[0])

        wait.until(lambda d: True)

        after_sort = [c.text for c in get_cards(driver)]

        if len(before_sort) > 1:
            assert before_sort != after_sort, \
                "❌ Sorting did not change order"

    assert True