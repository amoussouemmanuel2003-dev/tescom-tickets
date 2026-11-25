const AppError = require('../utils/AppError');
const { isNonEmptyString, parsePositiveInt, throwIfErrors } = require('./common');

const TYPES_DEMANDE = [
  'incident',
  'maintenance',
  'installation',
  'reclamation',
  'information',
  'autre',
];

const PRIORITES = ['faible', 'moyenne', 'haute', 'urgente'];

const STATUTS = [
  'Nouveau',
  'Assigné',
  'En cours',
  'En attente client',
  'Résolu',
  'Clôturé',
];

const validateCreateTicket = (body = {}, userRole) => {
  const errors = [];

  if (!isNonEmptyString(body.titre) || body.titre.trim().length > 200) {
    errors.push('Le titre est obligatoire (200 caractères maximum).');
  }
  if (!isNonEmptyString(body.description)) {
    errors.push('La description est obligatoire.');
  }
  if (!TYPES_DEMANDE.includes(body.type_demande)) {
    errors.push(`Le type de demande doit être parmi : ${TYPES_DEMANDE.join(', ')}.`);
  }
  if (!PRIORITES.includes(body.priorite)) {
    errors.push(`La priorité doit être parmi : ${PRIORITES.join(', ')}.`);
  }

  let clientId = null;
  if (userRole === 'admin' || userRole === 'employe') {
    const num = Number(body.client_id);
    if (!Number.isInteger(num) || num <= 0) {
      errors.push('Un client valide (client_id) est obligatoire.');
    } else {
      clientId = num;
    }
  }

  throwIfErrors(errors);

  return {
    titre: body.titre.trim(),
    description: body.description.trim(),
    type_demande: body.type_demande,
    priorite: body.priorite,
    client_id: clientId,
  };
};

const validateUpdateTicket = (body = {}, userRole) => {
  if (userRole === 'client') {
    const forbiddenFields = ['type_demande', 'priorite', 'statut', 'technicien_id', 'client_id'];
    const attemptedForbidden = forbiddenFields.filter((f) => body[f] !== undefined);
    if (attemptedForbidden.length > 0) {
      throw new AppError(
        'Un client ne peut modifier que le titre et la description d\'un ticket au statut Nouveau.',
        403
      );
    }

    const errors = [];
    if (!isNonEmptyString(body.titre) || body.titre.trim().length > 200) {
      errors.push('Le titre est obligatoire (200 caractères maximum).');
    }
    if (!isNonEmptyString(body.description)) {
      errors.push('La description est obligatoire.');
    }
    throwIfErrors(errors);

    return {
      titre: body.titre.trim(),
      description: body.description.trim(),
    };
  }

  const errors = [];
  if (!isNonEmptyString(body.titre) || body.titre.trim().length > 200) {
    errors.push('Le titre est obligatoire (200 caractères maximum).');
  }
  if (!isNonEmptyString(body.description)) {
    errors.push('La description est obligatoire.');
  }
  if (!TYPES_DEMANDE.includes(body.type_demande)) {
    errors.push(`Le type de demande doit être parmi : ${TYPES_DEMANDE.join(', ')}.`);
  }
  if (!PRIORITES.includes(body.priorite)) {
    errors.push(`La priorité doit être parmi : ${PRIORITES.join(', ')}.`);
  }

  throwIfErrors(errors);

  return {
    titre: body.titre.trim(),
    description: body.description.trim(),
    type_demande: body.type_demande,
    priorite: body.priorite,
  };
};

const validateAssignTicket = (body = {}) => {
  const technicien_id = parsePositiveInt(body.technicien_id, 'technicien_id');
  return {
    technicien_id,
    commentaire: isNonEmptyString(body.commentaire) ? body.commentaire.trim() : null,
  };
};

const validateStatusChange = (body = {}) => {
  const errors = [];
  if (!STATUTS.includes(body.statut)) {
    errors.push(`Le statut doit être parmi : ${STATUTS.join(', ')}.`);
  }
  throwIfErrors(errors);

  return {
    statut: body.statut,
    commentaire: isNonEmptyString(body.commentaire) ? body.commentaire.trim() : null,
  };
};

const validateCloseTicket = (body = {}) => ({
  commentaire: isNonEmptyString(body.commentaire) ? body.commentaire.trim() : null,
});

module.exports = {
  TYPES_DEMANDE,
  PRIORITES,
  STATUTS,
  validateCreateTicket,
  validateUpdateTicket,
  validateAssignTicket,
  validateStatusChange,
  validateCloseTicket,
};
