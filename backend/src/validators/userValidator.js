const { EMAIL_REGEX, isNonEmptyString, throwIfErrors } = require('./common');

const ROLES_AUTORISES = ['admin', 'employe', 'technicien', 'client'];

const validateCreateUser = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.nom)) errors.push('Le nom est obligatoire.');
  if (!isNonEmptyString(body.prenom)) errors.push('Le prénom est obligatoire.');
  if (!isNonEmptyString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('Une adresse email valide est obligatoire.');
  }
  if (typeof body.mot_de_passe !== 'string' || body.mot_de_passe.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }
  if (!ROLES_AUTORISES.includes(body.role)) {
    errors.push(`Le rôle doit être parmi : ${ROLES_AUTORISES.join(', ')}.`);
  }

  throwIfErrors(errors);

  return {
    nom: body.nom.trim(),
    prenom: body.prenom.trim(),
    email: body.email.trim().toLowerCase(),
    telephone: isNonEmptyString(body.telephone) ? body.telephone.trim() : null,
    mot_de_passe: body.mot_de_passe,
    role: body.role,
    actif: typeof body.actif === 'boolean' ? body.actif : true,
  };
};

const validateUpdateUser = (body = {}) => {
  const errors = [];

  if (!isNonEmptyString(body.nom)) errors.push('Le nom est obligatoire.');
  if (!isNonEmptyString(body.prenom)) errors.push('Le prénom est obligatoire.');
  if (!isNonEmptyString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('Une adresse email valide est obligatoire.');
  }
  if (!ROLES_AUTORISES.includes(body.role)) {
    errors.push(`Le rôle doit être parmi : ${ROLES_AUTORISES.join(', ')}.`);
  }
  if (
    body.mot_de_passe !== undefined &&
    body.mot_de_passe !== '' &&
    (typeof body.mot_de_passe !== 'string' || body.mot_de_passe.length < 8)
  ) {
    errors.push('Le nouveau mot de passe doit contenir au moins 8 caractères.');
  }

  throwIfErrors(errors);

  return {
    nom: body.nom.trim(),
    prenom: body.prenom.trim(),
    email: body.email.trim().toLowerCase(),
    telephone: isNonEmptyString(body.telephone) ? body.telephone.trim() : null,
    role: body.role,
    mot_de_passe: body.mot_de_passe ? body.mot_de_passe : null,
  };
};

const validateStatusFlag = (body = {}) => {
  const errors = [];
  if (typeof body.actif !== 'boolean') {
    errors.push('Le champ "actif" doit être un booléen (true ou false).');
  }
  throwIfErrors(errors);
  return { actif: body.actif };
};

module.exports = {
  ROLES_AUTORISES,
  validateCreateUser,
  validateUpdateUser,
  validateStatusFlag,
};
