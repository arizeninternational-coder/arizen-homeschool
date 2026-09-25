import hmac, hashlib, json, base64, time

secret = 'arizen-dev-secret-change-in-production'
header = base64.urlsafe_b64encode(json.dumps({"alg":"HS256","typ":"JWT"}).encode()).rstrip(b'=').decode()
payload = base64.urlsafe_b64encode(json.dumps({
    "name": "Test Student",
    "email": "test@example.com",
    "sub": "test-user-id",
    "role": "LEARNER",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600,
}).encode()).rstrip(b'=').decode()
sig = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b'=').decode()
token = f"{header}.{payload}.{sig_b64}"
with open('.jwt_token', 'w') as f:
    f.write(token)
print("Token written to .jwt_token")
print("TOKEN:", token)
