# Auth API

> Authentication endpoints for Admin and Client Portal.

---

## Admin Login — `POST /api/auth/login`
### Request
```json
{
  "password": "admin-password",
  "totpCode": "123456"
}
```

### Flow
1. Validates password against `ADMIN_PASSWORD` env var
2. Verifies TOTP code against stored secret
3. Generates JWT token
4. Sets `admin_session` cookie (httpOnly, secure, sameSite: strict)
5. Returns success

### Response
- `200` — Login successful
- `401` — Invalid credentials

## Admin Logout — `POST /api/auth/logout`
- Clears `admin_session` cookie
- Returns success

## TOTP Setup — `POST /api/auth/totp-setup`
- Generates new TOTP secret
- Returns QR code URL for authenticator app setup
- Used during initial admin setup

## Client Portal Login — `POST /api/portal/login`
### Request
```json
{
  "email": "client@example.com",
  "password": "client-password"
}
```

### Flow
1. Looks up client by email in Convex `clients` table
2. Verifies password against bcrypt hash
3. Creates session in `client_sessions` table
4. Sets `portal_session` cookie
5. Returns client info

## Portal Session — `GET /api/portal/session`
- Validates `portal_session` cookie
- Returns client data if valid
- Returns 401 if expired or invalid

---

## Related
- [[Security — CSP & Auth]]
- [[Admin Dashboard Overview]]
- [[Client Portal Overview]]
