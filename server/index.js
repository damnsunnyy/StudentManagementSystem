import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import studentsRouter from './routes/students.js';
import { createRegisteredAccount, findDemoAccount, findDemoAccountForRole, findRegisteredAccount, issueToken, requireAuth } from './auth.js';
import programsRouter from './routes/programs.js';
import { seedCurriculum } from './curriculumSeed.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'offline',
  });
});
app.post('/api/auth/register', async (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  }
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must be 8–128 characters and include an uppercase letter, a lowercase letter, and a number.' });
  }
  try {
    const user = await createRegisteredAccount({ name, email, password });
    res.status(201).json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});
app.post('/api/auth/demo', (req, res) => {
  const account = findDemoAccountForRole(req.body?.role);
  if (!account) return res.status(404).json({ message: 'That demo role is not configured.' });
  const { password: _password, ...user } = account;
  res.json({ token: issueToken(account), user });
});
app.post('/api/auth/login', async (req, res, next) => {
  try {
  if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string' || !req.body.email.trim() || !req.body.password) {
    return res.status(400).json({ message: 'Enter your email address and password.' });
  }
  const account = findDemoAccount(req.body?.email, req.body?.password) || await findRegisteredAccount(req.body?.email, req.body?.password);
  if (!account) return res.status(401).json({ message: 'Email or password is incorrect.' });
  const { password: _password, ...user } = account;
  res.json({ token: issueToken(account), user });
  } catch (error) { next(error); }
});
app.use('/api', requireAuth);
app.use('/api/students', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)
    && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }
  next();
}, (req, res, next) => {
  if (req.method !== 'GET' && req.account.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required to change student records.' });
  next();
}, studentsRouter);
app.use('/api/programs', programsRouter);

app.use((error, _req, res, _next) => {
  if (res.headersSent) return;
  if (error.name === 'ValidationError' || error.name === 'StrictModeError' || error.code === 11000) {
    return res.status(400).json({
      message: error.code === 11000 ? 'That email is already registered.' : error.message,
    });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  console.error(error);
  res.status(500).json({ message: 'Something went wrong while processing the request.' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5001;
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(async () => { await seedCurriculum(); console.log('MongoDB connected'); })
      .catch((error) => console.error('MongoDB connection failed:', error.message));
  } else {
    console.warn('MONGODB_URI is missing. The API health check will report the database as unavailable.');
  }
  app.listen(port, () => console.log(`NexaCampus API listening on http://localhost:${port}`));
}
