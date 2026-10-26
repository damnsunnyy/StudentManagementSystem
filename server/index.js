import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import studentsRouter from './routes/students.js';

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
app.use('/api/students', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)
    && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }
  next();
}, studentsRouter);

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
      .then(() => console.log('MongoDB connected'))
      .catch((error) => console.error('MongoDB connection failed:', error.message));
  } else {
    console.warn('MONGODB_URI is missing. The API health check will report the database as unavailable.');
  }
  app.listen(port, () => console.log(`NexaCampus API listening on http://localhost:${port}`));
}
