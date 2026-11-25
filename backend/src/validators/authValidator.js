const { EMAIL_REGEX, isNonEmptyString, throwIfErrors } = require('./common');

const validateRegister = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.nom)) errors.push('Le nom est obligatoire.');
  if (!isNonEmptyString(body.prenom)) errors.push('Le prénom est obligatoire.');
  if (!isNonEmptyString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('Une adresse email valide est obligatoire.');
  }
  if (typeof body.mot_de_passe !== 'string' || body.mot_de_passe.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }

  throwIfErrors(errors);

  const nom = body.nom.trim();
  const prenom = body.prenom.trim();

  return {
    nom,
    prenom,
    email: body.email.trim().toLowerCase(),
    telephone: isNonEmptyString(body.telephone) ? body.telephone.trim() : null,
    mot_de_passe: body.mot_de_passe,
    nom_client: isNonEmptyString(body.nom_client) ? body.nom_client.trim() : `${prenom} ${nom}`,
    nom_contact: isNonEmptyString(body.nom_contact) ? body.nom_contact.trim() : `${prenom} ${nom}`,
    adresse: isNonEmptyString(body.adresse) ? body.adresse.trim() : null,
  };
};

const validateLogin = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('Une adresse email valide est obligatoire.');
  }
  if (!isNonEmptyString(body.mot_de_passe)) {
    errors.push('Le mot de passe est obligatoire.');
  }

  throwIfErrors(errors);

  return {
    email: body.email.trim().toLowerCase(),
    mot_de_passe: body.mot_de_passe,
  };
};

const validateUpdateMe = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.nom)) errors.push('Le nom est obligatoire.');
  if (!isNonEmptyString(body.prenom)) errors.push('Le prénom est obligatoire.');

  if (body.nouveau_mot_de_passe !== undefined && body.nouveau_mot_de_passe !== '') {
    if (!isNonEmptyString(body.ancien_mot_de_passe)) {
      errors.push('L\'ancien mot de passe est requis pour modifier le mot de passe.');
    }
    if (typeof body.nouveau_mot_de_passe !== 'string' || body.nouveau_mot_de_passe.length < 8) {
      errors.push('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    }
  }

  throwIfErrors(errors);

  return {
    nom: body.nom.trim(),
    prenom: body.prenom.trim(),
    telephone: isNonEmptyString(body.telephone) ? body.telephone.trim() : null,
    ancien_mot_de_passe: body.ancien_mot_de_passe || null,
    nouveau_mot_de_passe: body.nouveau_mot_de_passe || null,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateMe,
};
