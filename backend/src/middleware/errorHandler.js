const { sendError } = require('../utils/apiResponse');

/**
 * Middleware global de gestion des erreurs Express.
 */
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Erreur de syntaxe JSON dans le corps de requête
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Format JSON invalide.');
  }

  // Contraintes PostgreSQL courantes
  if (err.code === '23505') {
    return sendError(res, 409, 'Cette ressource existe déjà (conflit d\'unicité).');
  }

  if (err.code === '23503') {
    return sendError(res, 400, 'Référence liée introuvable ou invalide.');
  }

  if (err.code === '23514') {
    return sendError(res, 400, 'Les données ne respectent pas les contraintes attendues.');
  }

  console.error('Erreur serveur non gérée :', err.message);
  return sendError(res, 500, 'Erreur interne du serveur.');
};

module.exports = errorHandler;
