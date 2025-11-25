from typing import Dict, List

_USERS: Dict[int, Dict] = {}


def _ensure_user(user_id: int):
    if user_id not in _USERS:
        _USERS[user_id] = {"XP": 0, "SalesCoins": 0, "Level": 1, "badges": []}


def get_demo_stats(user_id: int) -> Dict:
    _ensure_user(user_id)
    return {"user_id": user_id, **_USERS[user_id]}


def award_xp(user_id: int, amount: int) -> Dict:
    _ensure_user(user_id)
    _USERS[user_id]["XP"] += int(amount)
    _USERS[user_id]["Level"] = 1 + (_USERS[user_id]["XP"] // 1000)
    return get_demo_stats(user_id)


def award_salescoins(user_id: int, amount: int) -> Dict:
    _ensure_user(user_id)
    _USERS[user_id]["SalesCoins"] += int(amount)
    return get_demo_stats(user_id)


def unlock_badge(user_id: int, badge: str) -> Dict:
    _ensure_user(user_id)
    if badge not in _USERS[user_id]["badges"]:
        _USERS[user_id]["badges"].append(badge)
    return get_demo_stats(user_id)


def get_leaderboard(top: int = 10) -> List[Dict]:
    items = [{"user_id": uid, **data} for uid, data in _USERS.items()]
    items.sort(key=lambda x: x.get("XP", 0), reverse=True)
    return items[:top]
