import json
import urllib.parse
import urllib.request

url = "http://127.0.0.1:8000/fu_auth/jwt/login"
# 1) JSON body
data = json.dumps({"username": "test@example.com", "password": "s"}).encode()
req = urllib.request.Request(
    url, data=data, headers={"Content-Type": "application/json"}
)
try:
    r = urllib.request.urlopen(req)
    print("JSON status", r.status, r.read())
except Exception as e:
    print("JSON error", e)
# 2) JSON wrapper {data: {...}}
data = json.dumps({"data": {"username": "test@example.com", "password": "s"}}).encode()
req = urllib.request.Request(
    url, data=data, headers={"Content-Type": "application/json"}
)
try:
    r = urllib.request.urlopen(req)
    print("JSON-wrap status", r.status, r.read())
except Exception as e:
    print("JSON-wrap error", e)
# 3) form-urlencoded
form = urllib.parse.urlencode(
    {"username": "test@example.com", "password": "s"}
).encode()
req = urllib.request.Request(
    url, data=form, headers={"Content-Type": "application/x-www-form-urlencoded"}
)
try:
    r = urllib.request.urlopen(req)
    print("FORM status", r.status, r.read())
except Exception as e:
    print("FORM error", e)
