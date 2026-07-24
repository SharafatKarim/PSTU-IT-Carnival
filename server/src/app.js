const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'PSTU IT Carnival API',
    data: { docs: '/api/v1/health' },
  });
});

app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PSTU IT Carnival 2026 API',
  });
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/registrations', registrationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
