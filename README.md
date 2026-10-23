# Evergreen College Portal

A dark forest themed MERN college management proof of concept for maintaining a college student register and tracking academic standing.

## Features

- Campus dashboard with enrollment, active student, department and attendance summaries
- Student profiles with unique student ID, contact details, program, department, year, semester and age
- Enrollment status, attendance percentage and fee status tracking
- Create, update and delete student records
- Search across student name, email, student ID and department
- Department and enrollment status filters; sort by name, recent enrollment or attendance
- Export the current student list to CSV
- REST API input validation, duplicate email / ID handling and database error responses
- Responsive forest green interface

This is a focused college administration PoC. It does not yet include authentication, role permissions, faculty records, timetable management, or payment processing.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and MongoDB 8.0+ (local or Atlas).

Start the API:

```sh
cd backend
npm install
cp .env.example .env
npm run dev
```

Start the frontend in another terminal:

```sh
cd frontend
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). The backend listens on port 5000 and uses `mongodb://127.0.0.1:27017/collegeDB` by default.

## API

- `GET /api/health` — API status
- `GET /api/dashboard` — enrollment and attendance summary
- `GET /api/students` — list records; accepts `search`, `course`, `department`, `status` and `feeStatus`
- `POST /api/students` — enroll a student
- `PUT /api/students/:id` — update a student
- `DELETE /api/students/:id` — remove a student

## Deployment

The repository includes a Render Blueprint in `render.yaml`. To publish the full MERN app:

1. Create a MongoDB Atlas database and allow the Render service to connect to it.
2. Open the [Render Blueprint deploy page](https://render.com/deploy?repo=https://github.com/damnsunnyy/StudentManagementSystem) and connect the repository.
3. Set the requested `MONGODB_URI` secret on the API service. The Blueprint connects the frontend and API at the configured Render URLs.
4. Once the deploy finishes, add the public frontend URL to this README under **Live demo**.

The app needs a MongoDB connection string to run; a frontend-only GitHub Pages publish is not a live college management deployment.

## Live demo

Deployment pending: the app needs a MongoDB Atlas URI and a connected hosting account before a live URL can be published.
