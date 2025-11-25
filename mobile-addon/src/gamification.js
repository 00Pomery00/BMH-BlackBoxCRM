const _state = {}

function _ensure(user_id) {
  if (!_state[user_id]) _state[user_id] = { XP: 0, SalesCoins: 0, Level: 1, badges: [] }
}

export function getGamification(user_id = 1) {
  _ensure(user_id)
  return _state[user_id]
}

export function awardXP(user_id = 1, xp = 0) {
  _ensure(user_id)
  _state[user_id].XP += xp
  _state[user_id].Level = 1 + Math.floor(_state[user_id].XP / 1000)
  return _state[user_id]
}

export function awardCoins(user_id = 1, c = 0) {
  _ensure(user_id)
  _state[user_id].SalesCoins += c
  return _state[user_id]
}
