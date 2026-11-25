const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Vérifie le jeton JWT Bearer et charge l'utilisateur actif depuis PostgreSQL.
 */
const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentification requise. Jeton manquant.', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authentification requise. Jeton invalide.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Session expirée ou jeton invalide.', 401);
  }

  const { rows } = await db.query(
    `SELECT id, nom, prenom, email, telephone, role, actif, created_at
     FROM users
     WHERE id = $1`,
    [decoded.id]
  );

  if (rows.length === 0) {
    throw new AppError('Compte utilisateur introuvable.', 401);
  }

  const user = rows[0];
  if (!user.actif) {
    throw new AppError('Votre compte est désactivé. Contactez un administrateur.', 403);
  }

  req.user = user;
  next();
});

module.exports = auth;
