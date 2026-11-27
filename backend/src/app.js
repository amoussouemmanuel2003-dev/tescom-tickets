
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

// Origines autorisées
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
];

// Configuration CORS
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: certains outils API)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Origine CORS refusée :', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Route de vérification
app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, 200, 'API TESCOM-CI opérationnelle.');
});

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Route inconnue
app.use((req, res) => {
  return sendError(res, 404, 'Route API introuvable.');
});

// Gestion des erreurs
app.use(errorHandler);

module.exports = app;
