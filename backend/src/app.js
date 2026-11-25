const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess, sendError } = require('./utils/apiResponse');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, 200, 'API TESCOM-CI opérationnelle.');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((req, res) => {
  return sendError(res, 404, 'Route API introuvable.');
});

app.use(errorHandler);

module.exports = app;
