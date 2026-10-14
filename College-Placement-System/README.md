# College Placement System

React (Vite) + Express + MongoDB (Mongoose). JavaScript, ES modules, REST, JWT auth.

```
College-Placement-System/
├── backend/            Express API  (src/models, routes, middleware, services, seed.js, tests/)
├── frontend/           React + Vite SPA (src/pages, components.jsx, api.js, auth.jsx)
├── scripts/            check-api-contract.mjs  (frontend calls ⇄ backend routes)
├── README.md
└── .gitignore
```

## Modules
| Area | What it does |
|---|---|
| Student | Register/login, profile (branch, year, CGPA, backlogs, skills), PDF resume upload (type, size and `%PDF` signature validated), drives with live eligibility check, applications + status tracking, tests, results, notifications, dashboard |
| Aptitude practice | 4 categories × easy/medium/hard, timed quizzes, XP/levels/badges/streaks, daily challenge (same 5 questions for everyone each IST day, 2× XP), history, weak-topic analysis, leaderboard. Stored in separate collections: **never mixed with official results** |
| Weekly tests | Manual or question-bank questions, shuffled questions/options, duration, start/deadline, negative marking, branch/year/batch/individual targeting, optional Saturday/Sunday (IST) enforcement, draft → pending approval → published → scheduled/active/closed, auto evaluation, result/review policies, participation + per-question analytics, CSV export (Excel-compatible, formula-injection safe) |
| Delegated coordinators | Admin authorises third-year TPO members / faculty for specific branches (+ optional years); permission edit/revoke; optional approval before publishing; branch-scoped dashboards, student lists and results; audit log. **Enforced in backend queries**, not only in the UI |
| Placement | Companies, drives, eligibility rules, applications, status updates (with notifications), analytics, placements CSV |

Roles: `student`, `tpo_admin` (also serves as the Admin role), `tpo_member` (delegated, year-3), `faculty` (delegated coordinator).

## Setup (Linux)
Prerequisites: Node.js 18+ (20/22 recommended), npm, and a MongoDB (local or Atlas).

```bash
unzip College-Placement-System.zip
cd College-Placement-System

# Backend
cd backend
npm install
cp .env.example .env
nano .env            # fill MONGO_URI, JWT_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
npm run seed         # creates the first TPO admin + 24 practice questions
npm run dev          # API on http://localhost:5000  (or: npm start)

# Frontend (second terminal)
cd College-Placement-System/frontend
npm install
npm run dev          # http://localhost:5173  (proxies /api to the backend)
```
Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### `.env` variables (backend/.env — never commit it)
`MONGO_URI`, `JWT_SECRET` (≥24 chars), `PORT` (default 5000), `JWT_EXPIRES_IN` (default 7d), `CLIENT_ORIGIN` (default `http://localhost:5173`), `SEED_ADMIN_NAME/EMAIL/PASSWORD` (used only by `npm run seed`, password ≥10 chars).
If the frontend is served from another origin in production, set `VITE_API_URL` (see `frontend/.env.example`) and add that origin to `CLIENT_ORIGIN`.

### MongoDB
* **Local:** `MONGO_URI=mongodb://127.0.0.1:27017/college_placement`
* **Atlas:** create a free cluster → *Database Access*: add a user with a strong password and `readWrite` on your database only → *Network Access*: add **your current IP** (avoid `0.0.0.0/0`; for a hosted server use its fixed egress IP) → *Connect → Drivers*, copy the `mongodb+srv://…` string, replace `<password>` (URL-encode special characters) and add the database name before `?`.
Indexes (unique attempt per student/test, unique application per drive/student, etc.) are created automatically on first start.

## Testing
```bash
cd backend && npm test        # unit tests: scoring, branch permissions, targeting, eligibility, policies, CSV safety
cd backend && npm run check   # syntax check of every backend file
node scripts/check-api-contract.mjs   # from project root: every frontend API call has a backend route
cd frontend && npm run build  # production build
```
Manual walkthrough:
1. Log in as the seeded admin. *Companies* → add one; *Drives* → add a drive (CGPA/branch rules).
2. Register a student (Computer Engineering, year 4) in a private window; complete the profile, upload a PDF resume, apply from *Placement Drives* (an ineligible student sees the reasons).
3. Admin → *Coordinators* → authorise a member: year 3, branch Computer Engineering, years 4. Log in as that member: only CE students/tests are visible; a test targeting another branch is rejected with 403; without “publish directly” the test goes to *pending approval* and the admin approves it.
4. As the student open *Weekly tests* → start. Verify: timer, autosave indicator, fullscreen/tab warnings, Back button = submit + final marks, refresh = resume, double submit returns the same result.
5. Coordinator/admin → *Results* → analytics + *Export CSV*. Admin → *Audit Log*.
6. Student → *Aptitude Practice*: quiz, daily challenge, badges, leaderboard.

## Exam integrity design (and limits)
* Server owns the clock (`expiresAt = min(start + duration, deadline)`); autosave after expiry is refused and the attempt is finalised. A 30 s background sweep finalises abandoned attempts.
* Correct answers are never sent to students during a test; the client only sends `{questionId, optionId}`. Unknown ids are discarded; marks are computed server-side only.
* Finalisation is idempotent (atomic update only matches `in_progress`), one attempt per student per test (unique index), so duplicate/concurrent submits and retries return the same stored result.
* Browser **Back** triggers `POST /attempts/:id/submit` (`reason=back_navigation`). Browsers don’t guarantee this event, so if it never reaches the server the attempt simply remains valid until the server deadline and is then auto-finalised; the student can resume after a network failure. Refresh/close does **not** submit.
* Fullscreen, tab-switch counting, no-copy/context-menu are deterrents recorded for the TPO. They cannot stop screenshots, second devices or all cheating.

## Security notes
bcrypt (cost 12), JWT re-validated against the DB on every request (revocation is immediate), helmet, CORS allow-list, rate-limited auth, Mongo-operator injection filter, whitelisted profile updates (role/permissions can’t be self-edited), resume files stored under random names and served only to the owner or in-scope staff. The JWT is kept in `localStorage` for simplicity; move to httpOnly cookies + CSRF protection if you need stronger XSS resilience.

## API summary (`/api`)
`auth` (register, login, me, change-password) · `meta` · `profile` (GET/PUT, resume) · `students` (staff, scoped) · `companies` · `drives` · `applications` (apply, mine, withdraw, admin list, status) · `questions` · `tests` (available, CRUD, publish, approve, reject, close, release-results, results, results.csv, analytics) · `attempts` (start, answers, submit, get, review, mine) · `practice` (sessions, daily, submit, profile, leaderboard) · `notifications` · `admin` (members, permissions, audit-logs) · `reports` (overview, placements.csv, student-dashboard).
