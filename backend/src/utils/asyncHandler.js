/**
 * Enveloppe un contrôleur Express asynchrone pour transmettre les erreurs à errorHandler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
