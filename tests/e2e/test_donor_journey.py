"""
STORY-10.1 | SUBTASK-10.1.2 — Donation Provider (DONOR) E2E Journey

All tests that need authentication use the `login_as_donor` fixture,
which injects a real JWT via API login — no UI login form required.
"""
import time
import pytest
from faker import Faker
from selenium.webdriver.common.by import By
from tests.pages.auth_page import AuthPage
from tests.pages.donor_create_donation_page import DonorCreateDonationPage
from tests.pages.base_page import BasePage

fake = Faker()


@pytest.fixture(scope="function")
def unique_donor_email():
    return f"donor_{int(time.time())}@restroplate.io"


# ─── REGISTRATION ─────────────────────────────────────────────────────────────

@pytest.mark.donor
class TestDonorRegistration:

    def test_TC_DONOR_001_register_donor_account(self, driver, base_url, unique_donor_email):
        """New user can register as DONOR and see the success message."""
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.start_registration("DONOR")
        auth.fill_registration_form(
            full_name=fake.name(),
            email=unique_donor_email,
            password="TestDonor@123",
            phone="+94771234567",
            address="6.9271, 79.8612",
        )
        auth.submit_registration()
        assert auth.is_registration_successful(), (
            f"Expected success message. Screenshot: {auth.take_screenshot('TC_DONOR_001_fail')}"
        )

    def test_TC_DONOR_001b_register_with_mismatched_passwords(
        self, driver, base_url, unique_donor_email
    ):
        """Registration with mismatched passwords shows an error."""
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.start_registration("DONOR")
        # Fill all fields but give mismatched passwords
        auth.find(*AuthPage.INPUT_FULLNAME).send_keys(fake.name())
        auth.find(*AuthPage.INPUT_EMAIL).send_keys(unique_donor_email)
        auth.find(*AuthPage.INPUT_PASSWORD).send_keys("TestDonor@123")
        auth.find(*AuthPage.INPUT_CONFIRM).send_keys("WrongPassword@999")
        auth.find(*AuthPage.INPUT_PHONE).send_keys("+94771234567")
        auth.submit_registration()
        error = auth.get_error_message()
        assert error, "Expected an error message for mismatched passwords."
        assert "password" in error.lower(), f"Expected 'password' in error, got: {error}"


# ─── LOGIN ────────────────────────────────────────────────────────────────────

@pytest.mark.donor
class TestDonorLogin:

    def test_TC_DONOR_002_login_donor_reaches_dashboard(
        self, driver, base_url, login_as_donor
    ):
        """
        DONOR dashboard is reachable after token injection.
        login_as_donor fixture handles API login + localStorage injection.
        """
        assert "/dashboard/donor" in driver.current_url, (
            f"Expected DONOR dashboard URL, got: {driver.current_url}"
        )

    def test_TC_DONOR_002b_invalid_credentials_shows_error(self, driver, base_url):
        """Login with wrong password shows an error message."""
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.login("nonexistent@restroplate.io", "WrongPass@999")
        time.sleep(2)
        error = auth.get_error_message()
        assert error, "Expected an error message for invalid credentials."


# ─── CREATE DONATION ──────────────────────────────────────────────────────────

@pytest.mark.donor
class TestDonorCreateDonation:

    def test_TC_DONOR_003_create_donation_listing(
        self, driver, base_url, login_as_donor
    ):
        """
        Authenticated DONOR can fill and submit the Create Donation form.
        - Uses ID selectors matching the actual HTML
        - availabilityTime is type="time" → send "10:00" not "2026-06-01T10:00"
        - is_submission_successful waits for StatusNotice or /my-donations redirect
        """
        create_page = DonorCreateDonationPage(driver, base_url)
        create_page.open()
        create_page.fill_donation_form(
            food_type="Rice and Curry",
            quantity="50",
            unit="kg",
            expiry_date="2027-12-31",
            pickup_address="6.9271, 79.8612",
            availability_time="10:00",
        )
        create_page.submit()
        assert create_page.is_submission_successful(), (
            "Expected donation creation success (notice or redirect). "
            f"Screenshot: {create_page.take_screenshot('TC_DONOR_003_fail')}"
        )

    def test_TC_DONOR_003b_empty_form_shows_validation_errors(
        self, driver, base_url, login_as_donor
    ):
        """Submitting an empty donation form shows validation errors."""
        create_page = DonorCreateDonationPage(driver, base_url)
        create_page.open()
        create_page.submit()
        time.sleep(1)
        # Should stay on /create with error text visible
        error_elements = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'required') or contains(text(),'Please fix')]"
        )
        assert error_elements or "/create" in driver.current_url, (
            "Expected validation errors or to remain on /create."
        )


# ─── VIEW DONATIONS ───────────────────────────────────────────────────────────

@pytest.mark.donor
class TestDonorViewDonations:

    def test_TC_DONOR_004_view_my_donations_list(
        self, driver, base_url, login_as_donor
    ):
        """
        DONOR can navigate to /dashboard/donor/my-donations and see content.
        """
        base = BasePage(driver, base_url)
        base.navigate_to("/dashboard/donor/my-donations")
        time.sleep(2)

        assert "/my-donations" in driver.current_url, (
            f"Expected /my-donations, got: {driver.current_url}"
        )
        # Page shows donation rows or an empty state — either is valid
        content = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'donation') or contains(text(),'Donation') "
            "or contains(text(),'No ') or contains(text(),'empty')]"
        )
        assert content, "Expected donation list or empty state to be visible."


# ─── EXPLORE REQUESTS ─────────────────────────────────────────────────────────

@pytest.mark.donor
class TestDonorExploreRequests:

    def test_TC_DONOR_005_explore_dc_requests(
        self, driver, base_url, login_as_donor
    ):
        """
        DONOR can navigate to /dashboard/donor/explore and see the requests page.
        """
        base = BasePage(driver, base_url)
        base.navigate_to("/dashboard/donor/explore")
        time.sleep(2)

        assert "/explore" in driver.current_url, (
            f"Expected /explore, got: {driver.current_url}"
        )
        content = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'request') or contains(text(),'Request') "
            "or contains(text(),'No ') or contains(text(),'empty')]"
        )
        assert content, "Expected requests list or empty state."


# ─── FULL JOURNEY (SMOKE) ─────────────────────────────────────────────────────

@pytest.mark.donor
@pytest.mark.smoke
class TestDonorFullJourney:

    def test_TC_DONOR_006_full_journey_register_create_view(
        self, driver, base_url, unique_donor_email
    ):
        """
        TC-DONOR-006 (SMOKE): register → login → create donation → view requests

        Step 1: Register via UI
        Step 2: Login via API token injection (reliable)
        Step 3: Fill and submit donation form
        Step 4: Navigate to explore requests
        """
        from tests.conftest import _api_login, _inject_session

        # ── Step 1: Register via UI ─────────────────────────────────────────
        auth = AuthPage(driver, base_url)
        auth.open()
        auth.start_registration("DONOR")
        auth.fill_registration_form(
            full_name="Smoke Test Donor",
            email=unique_donor_email,
            password="TestDonor@123",
            phone="+94771234567",
        )
        auth.submit_registration()
        assert auth.is_registration_successful(), "Step 1 (Registration) failed."

        # ── Step 2: Login via API token injection ────────────────────────────
        data = _api_login(unique_donor_email, "TestDonor@123")
        _inject_session(driver, data, base_url)
        driver.get(f"{base_url}/dashboard/donor")
        time.sleep(1)
        assert "/dashboard/donor" in driver.current_url, "Step 2 (Login) failed."

        # ── Step 3: Create Donation ─────────────────────────────────────────
        create_page = DonorCreateDonationPage(driver, base_url)
        create_page.open()
        create_page.fill_donation_form(
            food_type="Bread",
            quantity="30",
            unit="loaves",
            expiry_date="2027-12-31",
            pickup_address="6.9271, 79.8612",
            availability_time="08:00",
        )
        create_page.submit()
        assert create_page.is_submission_successful(), "Step 3 (Create donation) failed."

        # ── Step 4: View Requests ───────────────────────────────────────────
        base = BasePage(driver, base_url)
        base.navigate_to("/dashboard/donor/explore")
        time.sleep(2)
        assert "/explore" in driver.current_url, "Step 4 (View requests) failed."
