# NexaCampus — Student Management PoC

NexaCampus is a MERN proof of concept for managing student enrollment records. It demonstrates a React interface, Express REST API, and MongoDB persistence with a browser-local demo mode when the API or database is unavailable.

## Problem, users, and objectives

**Problem:** Student information kept in scattered spreadsheets is difficult to search, update, and summarize consistently.

**Primary user:** A campus administrator or registrar who maintains enrollment records.

**PoC objectives:**

- Create, view, edit, search, filter, sort, and delete student records.
- Summarize enrollment by status and academic program.
- Demonstrate data validation and end-to-end React → Express → MongoDB CRUD.
- Keep the interface demonstrable without MongoDB using seeded sample data and browser local storage.

**Scope:** This is a classroom PoC. It covers student directory, dashboard, and course summary workflows. Authentication, authorization, production deployment, audit history, and real student data are out of scope. The administrator profile and academic term selector are presentation-only demo elements.

## Features

- Dashboard totals and enrollment summaries by course and status
- Student create, read, update, and delete workflows, including bulk delete
- Search by name, email, or course; filter by course; sort by name; paginate results
- CSV export of the currently filtered records
- Client-side form checks and server-side Mongoose validation
- MongoDB-backed records when configured; seeded local-storage demo mode otherwise

## Stack and structure

- **Front end:** React 18, React Router, Vite, Lucide icons
- **Back end:** Node.js, Express, CORS middleware
- **Database:** MongoDB through Mongoose

```text
src/                 React application and styles
server/index.js      Express app, health endpoint, middleware, startup
server/routes/       Student REST routes
server/models/       Mongoose student schema and model tests
```

The Vite development server proxies `/api` requests to Express on port 5001. The browser calls the API; Express validates and executes the database operation through Mongoose; the API response updates the React state. If the API request fails on initial load, the UI uses seeded sample data and stores demo changes in local storage.

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

If MongoDB is not configured or unavailable, `/api/health` reports the database as offline and persistent API operations cannot be completed; the React app still demonstrates CRUD in local-storage demo mode.

## API

Base path: `/api`

| Method | Route | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/health` | API and database readiness | `200` when connected, `503` when database is offline |
| GET | `/students` | List students, newest first | `200` |
| POST | `/students` | Create a student | `201` |
| PUT | `/students/:id` | Update editable student fields | `200` |
| DELETE | `/students/:id` | Delete a student | `204` |

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
4. Export the filtered list, then delete a sample record.
5. Explain the React → Express → Mongoose → MongoDB data flow and show `/api/health`.

Use fictional sample records only. Do not commit `.env` or real student information.
