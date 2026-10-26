# NexaCampus — Student Management PoC

NexaCampus is a MERN classroom application for managing student enrollment and a layered academic curriculum. It includes role-based sign-in, MongoDB persistence, analytics-style dashboards, and exports for common office formats.

## Problem, users, and objectives

**Problem:** Student information kept in scattered spreadsheets is difficult to search, update, and summarize consistently.

**Primary user:** A campus administrator or registrar who maintains enrollment records.

**PoC objectives:**

- Create, view, edit, search, filter, sort, and delete student records.
- Summarize enrollment by status and academic program.
- Demonstrate data validation and end-to-end React → Express → MongoDB CRUD.
- Organize each program into modules, units, and lessons.

**Scope:** This is a classroom application. It covers student directory, dashboard, curriculum hierarchy, and exports. Production deployment, audit history, and real student data are out of scope.

## Features

- Dashboard totals and enrollment summaries by course and status
- Student create, read, update, and delete workflows, including bulk delete
- Search by name, email, or course; filter by course; sort by name; paginate results
- Standalone `/curriculum` page plus cascading curriculum menu: programs → modules → units → lessons
- Admin-managed curriculum modules, units, and lessons stored in MongoDB
- Filtered reports as CSV, Excel-compatible `.xls`, Word-compatible `.doc`, print-to-PDF, and JSON
- Role-based administrator and read-only user access, with standard-user registration
- One-click administrator and viewer demo access on the sign-in page
- Responsive editorial dashboard styling with a forest palette, lime highlights, and horizontal navigation
- Client-side form checks and server-side Mongoose validation
- MongoDB-backed records when configured; seeded local-storage demo mode otherwise

## Stack and structure

- **Front end:** React 18, React Router, Vite, Lucide icons
- **Back end:** Node.js, Express, CORS middleware
- **Database:** MongoDB through Mongoose

```text
src/App.jsx                    Shared state, navigation, and API actions
src/pages/SignInPage.jsx       Login and account registration page
src/pages/DashboardPage.jsx    Enrollment overview page
src/pages/StudentsPage.jsx     Search, filter, and student directory page
src/pages/CurriculumPage.jsx   Nested program/module/unit/lesson page
src/components/StatCard.jsx   Reusable dashboard summary card
src/styles.css                 Shared theme and responsive page styles
server/index.js                Express app, authentication, and API setup
server/routes/                 Student and curriculum API routes
server/models/                 Mongoose student, user, and program schemas
server/curriculumSeed.js       Initial curriculum structure for six programs
```

The Vite development server proxies `/api` requests to Express on port 5001. The browser calls the API; Express validates and executes each database operation through Mongoose. On first startup, six sample program trees are added if the curriculum collection is empty.

## Setup and run

Requirements: Node.js 18 or newer and npm. MongoDB is needed for persistent database mode; the app can also be demonstrated in local demo mode.

```bash
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `.env` to a local MongoDB URL or an authorized MongoDB Atlas connection string. Then start the API and Vite:

```bash
npm run dev
```

Open the Vite URL printed in the terminal (usually <http://localhost:5173>). The API listens on port 5001. To build the front end, run `npm run build`. To run the API separately, use `npm run server`.

### Sign-in accounts

The local classroom setup provisions an administrator account in `.env` (the credential is not committed). Standard users can create their own accounts from the sign-in screen; registration always assigns the read-only `user` role.

- Administrator: `admin@nexacampus.edu` / `CampusAdmin2026!` — can create, edit, and delete student records.
- Standard user demo: `user@nexacampus.edu` / `CampusUser2026!` — can view and search records, but cannot change them. You can also register another standard user from the sign-in screen.

Registration validates a 2–80 character name, email format, matching confirmation, and a password of 8–128 characters containing uppercase, lowercase, and numeric characters. Passwords are salted and hashed before they are stored in MongoDB.

Change the administrator password in `.env` before sharing the project. `AUTH_SECRET` signs eight-hour API tokens; keep it private. This is a local proof of concept, not a production user-management system.

If MongoDB is not configured or unavailable, `/api/health` reports the database as offline and persistent API operations cannot be completed; the React app still demonstrates CRUD in local-storage demo mode.

## API

Base path: `/api`

| Method | Route | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/health` | API and database readiness | `200` when connected, `503` when database is offline |
| POST | `/auth/register` | Create a standard user account | `201` |
| POST | `/auth/login` | Sign in and issue an eight-hour API token | `200` |
| GET | `/students` | List students, newest first | `200` |
| POST | `/students` | Create a student | `201` |
| PUT | `/students/:id` | Update editable student fields | `200` |
| DELETE | `/students/:id` | Delete a student | `204` |
| GET | `/programs` | Read program curriculum trees | `200` |
| PUT | `/programs/:id` | Update modules, units, and lessons (admin only) | `200` |

Student fields: `name` (2–80 characters), `email` (valid format and unique), `course` (one of the six supported courses), `year` (1–6), and `status` (`Active`, `On leave`, or `Graduated`). Invalid input returns `400`; missing records return `404`; oversized JSON returns `413`. Duplicate emails receive a readable validation message.

## Validation and checks

Run the automated model validation checks and production build:

```bash
npm test
npm run build
```

The model tests cover email normalization, required fields, allowed course and status values, name length, and year range. For a live demonstration, also use `/api/health` and create, edit, list, and delete a sample record while MongoDB is connected.

## Demonstration flow

1. Open the dashboard and explain the enrollment summaries.
2. Search and filter the student directory, then open a record for editing.
3. Add a student and show validation for an invalid or duplicate email.
4. Open Curriculum and trace a program from module through unit to lesson; add a nested item if signed in as admin.
5. Export a filtered list or curriculum map as CSV, Excel-compatible `.xls`, Word-compatible `.doc`, JSON, or use print preview to save as PDF.
6. Explain the React → Express → Mongoose → MongoDB data flow and show `/api/health`.

Use fictional sample records only. Do not commit `.env` or real student information.
