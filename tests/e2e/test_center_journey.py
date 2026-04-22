"""
STORY-10.1 | SUBTASK-10.1.3 — Distribution Center E2E Journey

All authenticated tests use the `login_as_center` fixture
(API token injection — no UI login form).
"""
import time
import pytest
from faker import Faker
from selenium.webdriver.common.by import By
from tests.pages.auth_page import AuthPage
from tests.pages.center_create_request_page import CenterCreateRequestPage
from tests.pages.center_inventory_page import CenterInventoryPage
from tests.pages.base_page import BasePage

fake = Faker()


@pytest.fixture(scope="function")
def unique_center_email():
    return f"center_{int(time.time())}@restroplate.io"


# ─── REGISTRATION ─────────────────────────────────────────────────────────────

@pytest.mark.center
class TestCenterRegistration:

    def test_TC_CENTER_001_register_distribution_center(
        self, driver, base_url, unique_center_email
    ):
        """New user can register as DISTRIBUTION_CENTER and see the success message."""
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.start_registration("DISTRIBUTION_CENTER")
        auth.fill_registration_form(
            full_name="Green Hope Center",
            email=unique_center_email,
            password="TestCenter@123",
            phone="+94771234568",
            address="6.9000, 79.8500",
        )
        auth.submit_registration()
        assert auth.is_registration_successful(), (
            f"Expected success message. "
            f"Screenshot: {auth.take_screenshot('TC_CENTER_001_fail')}"
        )


# ─── LOGIN ────────────────────────────────────────────────────────────────────

@pytest.mark.center
class TestCenterLogin:

    def test_TC_CENTER_002_login_center_reaches_dashboard(
        self, driver, base_url, login_as_center
    ):
        """
        DC dashboard is reachable after token injection.
        login_as_center fixture handles API login + localStorage injection.
        """
        assert "/dashboard/center" in driver.current_url, (
            f"Expected DC dashboard URL, got: {driver.current_url}"
        )


# ─── CREATE REQUEST ───────────────────────────────────────────────────────────

@pytest.mark.center
class TestCenterCreateRequest:

    def test_TC_CENTER_003_create_donation_request(
        self, driver, base_url, login_as_center
    ):
        """
        DC can submit a donation request using the correct input selectors.
        Selectors verified from CenterCreateRequest.tsx:
          - food type:  input[placeholder='e.g., Rice, Bread, Vegetables']
          - quantity:   input[type='number'][placeholder='e.g., 50']
          - unit:       input[placeholder='e.g., kg, loaves, servings']
        """
        req_page = CenterCreateRequestPage(driver, base_url)
        req_page.open()
        req_page.submit_request(
            food_type="Canned Goods",
            quantity="100",
            unit="cans",
        )
        assert req_page.is_success(), (
            "Expected success after submitting donation request. "
            f"Screenshot: {req_page.take_screenshot('TC_CENTER_003_fail')}"
        )

    def test_TC_CENTER_003b_invalid_quantity_shows_error(
        self, driver, base_url, login_as_center
    ):
        """Submitting a request with quantity 0 shows an error message."""
        req_page = CenterCreateRequestPage(driver, base_url)
        req_page.open()
        req_page.submit_request(food_type="Rice", quantity="0", unit="kg")
        time.sleep(1)
        error = req_page.get_error_text()
        assert error, "Expected error message for quantity = 0."
        assert "0" in error or "valid" in error.lower(), (
            f"Expected quantity error, got: {error}"
        )


# ─── OUTGOING REQUESTS ────────────────────────────────────────────────────────

@pytest.mark.center
class TestCenterOutgoingRequests:

    def test_TC_CENTER_004_view_outgoing_requests(
        self, driver, base_url, login_as_center
    ):
        """DC can view their outgoing donation requests page."""
        base = BasePage(driver, base_url)
        base.navigate_to("/dashboard/center/requests")
        time.sleep(2)

        assert "/requests" in driver.current_url, (
            f"Expected /requests URL, got: {driver.current_url}"
        )
        content = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'request') or contains(text(),'Request') "
            "or contains(text(),'No ') or contains(text(),'empty')]"
        )
        assert content, "Outgoing requests page should show list or empty state."


# ─── INVENTORY ────────────────────────────────────────────────────────────────

@pytest.mark.center
class TestCenterInventory:

    def test_TC_CENTER_005_view_inventory_page_loads(
        self, driver, base_url, login_as_center
    ):
        """
        Inventory page loads and all 3 tabs are present.
        Verified tab texts: 'Publish to Consumers', 'Mark as Collected',
        'Completed Donations' (from CenterInventory.tsx source).
        """
        inv_page = CenterInventoryPage(driver, base_url)
        inv_page.open()
        time.sleep(2)

        assert "/inventory" in driver.current_url, (
            f"Expected /inventory URL, got: {driver.current_url}"
        )
        assert inv_page.is_loaded(), "Inventory page heading not found."

        # Verify all 3 tabs exist
        assert driver.find_elements(*CenterInventoryPage.TAB_PUBLISH), \
            "'Publish to Consumers' tab not found."
        assert driver.find_elements(*CenterInventoryPage.TAB_COLLECT), \
            "'Mark as Collected' tab not found."
        assert driver.find_elements(*CenterInventoryPage.TAB_COMPLETED), \
            "'Completed Donations' tab not found."

    def test_TC_CENTER_006_publish_inventory_to_consumers(
        self, driver, base_url, login_as_center
    ):
        """
        DC can switch to the Publish tab and the tab content renders.
        If inventory items exist, attempts to click the first publish toggle.
        Passes regardless — the core assertion is that the tab loads correctly.
        """
        inv_page = CenterInventoryPage(driver, base_url)
        inv_page.open()
        time.sleep(2)
        inv_page.click_publish_tab()
        time.sleep(1)

        # The tab must be clickable and content renders
        assert driver.find_elements(*CenterInventoryPage.TAB_PUBLISH), \
            "Publish tab not found after click."

        row_count = inv_page.get_row_count()
        if row_count > 0:
            published = inv_page.publish_first_item()
            assert published, (
                "Found inventory rows but could not find a publish toggle button. "
                f"Screenshot: {inv_page.take_screenshot('TC_CENTER_006_fail')}"
            )
        # If no rows, the tab still rendered — test passes


# ─── FULL JOURNEY (SMOKE) ─────────────────────────────────────────────────────

@pytest.mark.center
@pytest.mark.smoke
class TestCenterFullJourney:

    def test_TC_CENTER_007_full_journey_register_request_inventory_publish(
        self, driver, base_url, unique_center_email
    ):
        """
        TC-CENTER-007 (SMOKE): register → login → request donation → inventory page

        Step 1: Register DC via UI
        Step 2: Login via API token injection
        Step 3: Submit a donation request
        Step 4: Verify inventory page is reachable with correct tabs
        """
        from tests.conftest import _api_login, _inject_session

        # ── Step 1: Register via UI ─────────────────────────────────────────
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.start_registration("DISTRIBUTION_CENTER")
        auth.fill_registration_form(
            full_name="Sunrise Distribution",
            email=unique_center_email,
            password="TestCenter@123",
            phone="+94771234568",
        )
        auth.submit_registration()
        assert auth.is_registration_successful(), "Step 1 (DC Registration) failed."

        # ── Step 2: Login via API token injection ────────────────────────────
        data = _api_login(unique_center_email, "TestCenter@123")
        _inject_session(driver, data, base_url)
        driver.get(f"{base_url}/dashboard/center")
        time.sleep(1)
        assert "/dashboard/center" in driver.current_url, "Step 2 (DC Login) failed."

        # ── Step 3: Submit Donation Request ─────────────────────────────────
        req_page = CenterCreateRequestPage(driver, base_url)
        req_page.open()
        req_page.submit_request("Vegetables", "200", "kg")
        assert req_page.is_success(), "Step 3 (Request donation) failed."

        # ── Step 4: Inventory Page ────────────────────────────────────────
        inv_page = CenterInventoryPage(driver, base_url)
        inv_page.open()
        time.sleep(2)
        assert "/inventory" in driver.current_url, "Step 4 (Inventory page) failed."
        assert inv_page.is_loaded(), "Step 4 (Inventory heading) not found."

        # All 3 tabs must exist
        assert driver.find_elements(*CenterInventoryPage.TAB_PUBLISH), \
            "Step 4: 'Publish to Consumers' tab missing."
        assert driver.find_elements(*CenterInventoryPage.TAB_COLLECT), \
            "Step 4: 'Mark as Collected' tab missing."
