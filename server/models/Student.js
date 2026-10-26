import mongoose from 'mongoose';

export const STUDENT_COURSES = [
  'Computer Science',
  'Business Administration',
  'Graphic Design',
  'Psychology',
  'Data Science',
  'Engineering',
];
export const STUDENT_STATUSES = ['Active', 'On leave', 'Graduated'];

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  course: { type: String, required: true, enum: STUDENT_COURSES },
  year: { type: Number, required: true, min: 1, max: 6 },
  status: { type: String, enum: ['Active', 'On leave', 'Graduated'], default: 'Active' },
}, { timestamps: true, strict: 'throw' });

export default mongoose.model('Student', studentSchema);
