const { isNonEmptyString, throwIfErrors } = require('./common');

const validateCreateMessage = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.contenu)) {
    errors.push('Le contenu du message ne peut pas être vide.');
  }
  if (body.interne !== undefined && typeof body.interne !== 'boolean') {
    errors.push('Le champ "interne" doit être un booléen.');
  }

  throwIfErrors(errors);

  return {
    contenu: body.contenu.trim(),
    interne: Boolean(body.interne),
  };
};

module.exports = {
  validateCreateMessage,
};
