require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map((origin) => origin.trim());
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/students", async (req, res, next) => {
  try {
    const { search = "", course = "", department = "", status = "", feeStatus = "" } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { course: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
    if (course) query.course = course;
    if (department) query.department = department;
    if (status) query.status = status;
    if (feeStatus) query.feeStatus = feeStatus;
    res.json(await Student.find(query).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const [total, active, departments, feeDue, attendance] = await Promise.all([
      Student.countDocuments(), Student.countDocuments({ status: "Active" }),
      Student.distinct("department"), Student.countDocuments({ feeStatus: "Due" }),
      Student.aggregate([{ $group: { _id: null, average: { $avg: "$attendance" } } }]),
    ]);
    res.json({ total, active, departments: departments.filter(Boolean).length, feeDue, averageAttendance: Math.round(attendance[0]?.average || 0) });
  } catch (error) { next(error); }
});

app.post("/api/students", async (req, res, next) => {
  try { res.status(201).json(await Student.create(req.body)); }
  catch (error) { next(error); }
});

app.put("/api/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) { next(error); }
});

app.delete("/api/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  if (error.code === 11000) return res.status(409).json({ message: "That email address is already registered." });
  if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collegeDB")
  .then(() => app.listen(port, () => console.log(`API ready at http://localhost:${port}`)))
  .catch((error) => { console.error("Could not connect to MongoDB:", error.message); process.exit(1); });
