require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connexion PostgreSQL (Neon) vérifiée avec succès.');
  } catch (err) {
    console.error('Impossible de se connecter à PostgreSQL au démarrage :', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Serveur TESCOM-CI démarré sur http://localhost:${PORT}`);
  });
};

startServer();
