import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({ title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 } });
const unitSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  lessons: { type: [lessonSchema], default: [] },
});
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 240, default: '' },
  units: { type: [unitSchema], default: [] },
});

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  modules: { type: [moduleSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Program', programSchema);
