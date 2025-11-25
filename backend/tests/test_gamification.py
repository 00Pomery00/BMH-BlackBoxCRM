from app import gamification


def test_award_xp_and_leveling():
    user_id = 42
    s1 = gamification.get_demo_stats(user_id)
    assert s1["XP"] == 0
    gamification.award_xp(user_id, 1500)
    s2 = gamification.get_demo_stats(user_id)
    assert s2["XP"] == 1500
    assert s2["Level"] == 2


def test_award_salescoins_and_badges():
    user_id = 7
    gamification.award_salescoins(user_id, 100)
    gamification.unlock_badge(user_id, "EarlyAdopter")
    s = gamification.get_demo_stats(user_id)
    assert s["SalesCoins"] == 100
    assert "EarlyAdopter" in s["badges"]


def test_leaderboard_order():
    gamification.award_xp(1, 10)
    gamification.award_xp(2, 2000)
    board = gamification.get_leaderboard(5)
    assert board[0]["user_id"] == 2
