from backend.app.core.security import get_password_hash, verify_password


def test_password_hash():
    pw = "Secret123!"
    h = get_password_hash(pw)
    assert verify_password(pw, h)
