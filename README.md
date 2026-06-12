# Nobles Portal — Phase 1 (scaffold)

This folder contains a Phase 1 scaffold of the Nobles Portal built with Next.js (App Router), TypeScript and Tailwind.

Quick start:

1. cd nobles-portal
2. npm install
3. npm run dev

Open http://localhost:3001

Notes:
- Hardcoded SuperUser: `UCHE0001` / `admin123` (role: superuser)
- No mock staff data is included. Register staff from the Admin → Staff page.
- When creating staff, set a password — passwords are hashed using SHA-256 for this scaffold (replace with bcrypt/Supabase for production).
- Authentication uses a simple session cookie `nobles_session` and client-side persistence for demo purposes. Replace with Supabase Auth / JWT in production.

This scaffold provides client-side flows for Phase 1 (auth, dashboards, daily logs, verification). For production:

- Remove client-side storage and integrate a secure backend (Supabase/Postgres or similar).
- Use bcrypt or an auth provider for password hashing and secure sessions (JWT, HttpOnly cookies).
- Replace the in-memory/localStorage data with server-side persistence and proper RBAC checks.
