const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    course: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 1, max: 120 },
    studentId: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    department: { type: String, trim: true, maxlength: 80, default: "General" },
    phone: { type: String, trim: true, maxlength: 24, default: "" },
    year: { type: Number, min: 1, max: 8, default: 1 },
    semester: { type: Number, min: 1, max: 16, default: 1 },
    status: { type: String, enum: ["Active", "On leave", "Graduated"], default: "Active" },
    attendance: { type: Number, min: 0, max: 100, default: 0 },
    feeStatus: { type: String, enum: ["Paid", "Due", "Scholarship"], default: "Due" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
