# Day 1 — Backend foundation (Express + config + MySQL pool)

## Topics to cover (in order)

1. **Project layout** — `src/config`, `src/utils`, `src/middlewares`, `src/routes` (empty or stub).
2. **`package.json`** — `express`, `dotenv`, `zod`, `mysql2`, `cors`, `helmet`, `express-rate-limit ...`.
```bash 
npm install express dotenv zod mysql2 cors helmet express-rate-limit
```
3. **Environment** — copy `.env.example` → `.env`; explain **never commit** `.env`.
4. **`src/config/env.js`** — load `.env`, validate with Zod, `process.exit(1)` on failure.
5. **`src/config/database.js`** — `mysql2/promise` **pool** (`connectionLimit`, `enableKeepAlive`), export `closePool`.
6. **`src/app.js`** — `express()`, `helmet`, `cors`, `express.json()`, rate limit, `GET /health`, mount `/api` (can be empty router), `errorHandler` last.
7. **`src/server.js`** — read `PORT`, `listen`, **SIGTERM/SIGINT** → `closePool()` then exit.
8. **Optional demo route** — e.g. `GET /api/db-ping` that runs `SELECT 1` via the pool (proves DB credentials).

---

## Database for Day 1

1. Create database: `CREATE DATABASE employee_mgmt …` (utf8mb4).
2. Apply **only** this day’s script:

   ```bash
   mysql -u root -p employee_mgmt < ./database/schema.sql
   ```

Creates: `roles`, `permissions`, `role_permissions`.

---

## Map to files in this repo (reference)

| Concept                    | File(s)                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| Env validation             | `src/config/env.js`                                                     |
| Pool                       | `src/config/database.js`                                                |
| App factory                | `src/app.js`                                                            |
| Server + graceful shutdown | `src/server.js`                                                         |
| Errors                     | `src/middlewares/errorHandler.js`, `src/utils/ApiError.js`              |
| Route mounting             | `src/routes/index.js` (Day 1: can export empty `Router` or health only) |

> **Note:** The full project already wires all days. For **live teaching**, you can temporarily comment out later routes in `src/routes/index.js` so Day 1 only exposes `/health` (and optional `/api/db-ping`).

---

## Success checklist (Day 1 “done”)

- [ ] `npm install` completed (you will run when ready).
- [ ] `.env` has valid `DB_*` and `JWT_SECRET` (JWT not used until Day 2, but env file can be ready).
- [ ] `day-1/schema.sql` applied; `SHOW TABLES;` shows `roles`, `permissions`, `role_permissions`.
- [ ] `npm run dev` (or `node src/server.js`) starts without crashing.
- [ ] `GET http://localhost:4000/health` returns JSON OK.
- [ ] (Optional) `GET /api/db-ping` returns success if you added it.

---

## Prep for Day 2

Students should understand: **pool vs single connection**, **Zod env validation**, **error middleware last**, and that **`roles` must exist before `users.role_id` FK**.

**There is no “new since previous day” section** — this is the first day.
