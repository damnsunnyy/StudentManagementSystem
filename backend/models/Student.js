const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    course: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 1, max: 120 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
