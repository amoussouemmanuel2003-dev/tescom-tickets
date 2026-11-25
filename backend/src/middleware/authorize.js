const AppError = require('../utils/AppError');

/**
 * Vérifie que l'utilisateur connecté possède l'un des rôles autorisés.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentification requise.', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Accès refusé. Permissions insuffisantes.', 403));
  }

  return next();
};

module.exports = authorize;
