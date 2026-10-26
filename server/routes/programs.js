import { Router } from 'express';
import mongoose from 'mongoose';
import Program from '../models/Program.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try { res.json(await Program.find().sort({ name: 1 })); }
  catch (error) { next(error); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid program ID.' });
  if (!Array.isArray(req.body?.modules) || req.body.modules.length > 50) {
    return res.status(400).json({ message: 'A program can contain up to 50 modules.' });
  }
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, { modules: req.body.modules }, {
      new: true, runValidators: true, strict: 'throw',
    });
    if (!program) return res.status(404).json({ message: 'Program not found.' });
    res.json(program);
  } catch (error) { next(error); }
});

export default router;
