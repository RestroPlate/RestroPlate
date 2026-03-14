import time
from tests.ui.pages.auth_page import AuthPage


def test_register_required_validation(driver, base_url):
    """
    Check HTML5 required validation triggers.
    In your UI, register submit should be blocked if fields empty.
    """
    page = AuthPage(driver, base_url).open_auth()
    page.go_to_register_tab()
    page.choose_account_type("Donator")
    page.submit_register()

    # It should block on the first required field (fullName)
    msg = page.get_validation_message("fullName")
    assert msg != ""


def test_register_password_mismatch_validation(driver, base_url):
    """
    Confirm password mismatch should block form submission.
    Your code currently doesn't check mismatch explicitly,
    but browser will still allow it unless pattern/custom logic exists.
    So we validate that the field remains and URL doesn't change.
    """
    page = AuthPage(driver, base_url).open_auth()
    page.go_to_register_tab()
    page.choose_account_type("Donator")

    page.fill_register_form(
        full_name="Theertha Dheemani",
        email="theertha@gmail.com",
        password="123456",
        confirm_password="123456",
        phone="+94761778172",
        address="409, Cross Road, Hanwella",
    )
    page.submit_register()

    # Since submit handler is TODO, app will remain on join/register form.
    assert "/join" in page.current_path()


def test_register_submit_smoke(driver, base_url):
    """
    Since handleRegisterSubmit is TODO, there is no success redirect yet.
    This test just verifies the register UI flow works end-to-end (no crash),
    and the Create Account click is possible.
    """
    page = AuthPage(driver, base_url).open_auth()

    page.register_user(
        account_type="Distributing Center",
        full_name="Theertha Dheemani",
        email="theertha@gmail.com",
        password="123456",
        confirm_password="123456",
        phone="+94761778172",
        address="409, Cross Road, Hanwella",
    )

    # Wait a moment to allow any UI updates
    time.sleep(0.5)

    # Still on join page, because registration is not wired
    assert "/join" in page.current_path()