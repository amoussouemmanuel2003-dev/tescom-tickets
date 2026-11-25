const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

const parsePositiveInt = (val, fieldName = 'identifiant') => {
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) {
    throw new AppError(`Paramètre "${fieldName}" invalide.`, 400);
  }
  return num;
};

const throwIfErrors = (errors) => {
  if (errors.length > 0) {
    throw new AppError('Données invalides.', 400, errors);
  }
};

module.exports = {
  EMAIL_REGEX,
  isNonEmptyString,
  parsePositiveInt,
  throwIfErrors,
};
