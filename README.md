# NestJS Username + Password Authentication API

Backend for a Next.js frontend. Uses NestJS, MySQL, TypeORM, bcrypt, and JWT.

## 1. Requirements
- Node.js LTS
- MySQL (XAMPP is fine)
- A MySQL database user with permission to use `authentication_db`

## 2. Create the database
In phpMyAdmin, open the SQL tab and run the contents of `database.sql`.

## 3. Configure environment
Copy `.env.example` to `.env`, then update the database settings and set a long random `JWT_SECRET`.
Do not commit `.env` to GitHub.

Example local XAMPP settings:
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_USERNAME=root
- DB_PASSWORD= (empty only if your local MySQL root account has no password)
- DB_DATABASE=authentication_db
- FRONTEND_URL=http://localhost:3000

## 4. Install and run
```bash
npm install
npm run start:dev
```
API base URL: `http://localhost:3001/api`

## 5. Endpoints

### POST /api/auth/register
```json
{ "username": "jane", "password": "StrongPass123" }
```
Returns:
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "username": "jane" }
}
```

### POST /api/auth/login
Same request body and response shape as register.

### GET /api/auth/me
Header: `Authorization: Bearer <jwt>`

Returns:
```json
{ "user": { "id": 1, "username": "jane" } }
```

### POST /api/auth/logout
Header: `Authorization: Bearer <jwt>`

Returns a logout message. With stateless JWT, the frontend must delete its stored token. The token remains valid until expiry; use short expiry or a server-side token revocation strategy if immediate invalidation is required.

## 6. Frontend
Set `.env.local` in Next.js:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
Restart the Next.js dev server after changing `.env.local`.

The frontend should send JSON bodies using `username` and `password`. It should store the returned `token` and send it as a Bearer token when calling `/auth/me`.

## Notes
- Passwords are hashed with bcrypt (12 rounds); plain-text passwords are never stored.
- Duplicate usernames are rejected by both application logic and the database unique index.
- CORS is configured for `FRONTEND_URL`.
- For production, use HTTPS, a strong secret, restricted CORS, database least-privilege credentials, and migrations.
