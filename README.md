# Student Management System

A MERN student directory for creating, searching, filtering, updating, deleting, and exporting student records. This is a full-stack local application: the React interface calls an Express API backed by MongoDB.

## Features

- Search by student name, email, or course
- Filter records by course
- Create, edit, delete, and export student records
- REST endpoints with input validation and database error handling
- Vite + React client and Express + Mongoose API

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB Community 8.0 or a MongoDB connection string

## Run locally

Start the API in one terminal:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). MongoDB defaults to `mongodb://127.0.0.1:27017/collegeDB`; set `MONGODB_URI` in `backend/.env` to use another database. `PORT` defaults to `5000`; set `VITE_API_URL` in `frontend/.env` to point the browser client at a deployed API.

## API

- `GET /api/students` — list records; optional `search` and `course` query parameters
- `POST /api/students` — add a student
- `PUT /api/students/:id` — update a student
- `DELETE /api/students/:id` — delete a student
- `GET /api/health` — API status

The interface requires an API and database, so a static GitHub Pages site alone is not a live deployment of this app. Configure and deploy those services before sharing a hosted instance.
