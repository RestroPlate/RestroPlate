import os
from datetime import datetime, timedelta

import requests
import pytest
from tests.ui.pages.donor_dashboard_page import DonorDashboardPage


@pytest.fixture
def requested_donation_seed(base_url):
    api_base = os.getenv("VITE_API_BASE_URL", "http://localhost:5053").rstrip("/")
    login_url = f"{api_base}/api/auth/login"
    donations_url = f"{api_base}/api/donations"

    login_payload = {
        "email": "theertha@gmail.com",
        "password": "123456",
    }

    login_res = requests.post(login_url, json=login_payload, timeout=10)
    login_res.raise_for_status()

    token = login_res.json().get("token")

    if not token:
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    donation_payload = {
        "foodType": "Requested Status Seed Donation",
        "quantity": 1,
        "unit": "Box",
        "expirationDate": (datetime.today() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "pickupAddress": "Seed Location",
        "availabilityTime": "12:00",
        "status": "REQUESTED",
    }

    try:
        res = requests.post(donations_url, json=donation_payload, headers=headers, timeout=10)
        res.raise_for_status()
    except requests.RequestException:
        donation_payload.pop("status", None)
        requests.post(donations_url, json=donation_payload, headers=headers, timeout=10)


def test_existing_donation_statuses_are_visible_in_provider_list(
    driver, base_url, requested_donation_seed
):

    page = DonorDashboardPage(driver, base_url).login_as_donor()

    assert page.status_present("AVAILABLE")
    assert page.status_present("REQUESTED"), "Expected REQUESTED status in the donor list."
    assert page.status_present("COLLECTED")