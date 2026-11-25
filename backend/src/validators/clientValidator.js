const { EMAIL_REGEX, isNonEmptyString, throwIfErrors } = require('./common');

const validateClientPayload = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.nom_client)) {
    errors.push('Le nom du client (ou entreprise) est obligatoire.');
  }
  if (isNonEmptyString(body.email) && !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('Le format de l\'email est invalide.');
  }

  throwIfErrors(errors);

  return {
    nom_client: body.nom_client.trim(),
    nom_contact: isNonEmptyString(body.nom_contact) ? body.nom_contact.trim() : null,
    email: isNonEmptyString(body.email) ? body.email.trim().toLowerCase() : null,
    telephone: isNonEmptyString(body.telephone) ? body.telephone.trim() : null,
    adresse: isNonEmptyString(body.adresse) ? body.adresse.trim() : null,
  };
};

module.exports = {
  validateClientPayload,
};
