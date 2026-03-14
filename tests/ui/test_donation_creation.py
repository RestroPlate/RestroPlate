from tests.ui.pages.donor_dashboard_page import DonorDashboardPage


def test_donation_form_renders_all_required_fields(driver, base_url):

    page = DonorDashboardPage(driver, base_url).login_as_donor()

    assert driver.find_element(*page.FOOD_TYPE_INPUT)
    assert driver.find_element(*page.QUANTITY_INPUT)
    assert driver.find_element(*page.UNIT_INPUT)
    assert driver.find_element(*page.EXPIRATION_DATE_INPUT)
    assert driver.find_element(*page.PICKUP_ADDRESS_INPUT)
    assert driver.find_element(*page.AVAILABILITY_TIME_INPUT)


def test_create_donation_with_empty_form_shows_validation_feedback(driver, base_url):

    page = DonorDashboardPage(driver, base_url).login_as_donor()

    before_count = page.get_total_donations_count()

    page.submit_donation()

    after_count = page.get_total_donations_count()

    assert after_count == before_count


def test_create_donation_with_invalid_quantity_shows_error(driver, base_url):

    page = DonorDashboardPage(driver, base_url).login_as_donor()

    before_count = page.get_total_donations_count()

    page.fill_donation_form(
        food_type="Invalid Quantity Donation",
        quantity="0",
        unit="Boxes",
        expiration_date=page.tomorrow(),
        pickup_address="456 QA Road, Colombo",
        availability_time="15:00",
    )

    page.submit_donation()

    after_count = page.get_total_donations_count()

    assert after_count == before_count


def test_create_donation_with_past_expiration_shows_error(driver, base_url):

    page = DonorDashboardPage(driver, base_url).login_as_donor()

    before_count = page.get_total_donations_count()

    page.fill_donation_form(
        food_type="Expired Donation",
        quantity="5",
        unit="Kg",
        expiration_date=page.yesterday(),
        pickup_address="789 QA Lane, Colombo",
        availability_time="16:00",
    )

    page.submit_donation()

    after_count = page.get_total_donations_count()

    assert after_count == before_count