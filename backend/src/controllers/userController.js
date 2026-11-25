const userService = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { parsePositiveInt } = require('../validators/common');
const {
  validateCreateUser,
  validateUpdateUser,
  validateStatusFlag,
} = require('../validators/userValidator');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.query);
  return sendSuccess(res, 200, 'Liste des utilisateurs récupérée.', users);
});

const listTechniciens = asyncHandler(async (req, res) => {
  const techniciens = await userService.listActiveTechniciens();
  return sendSuccess(res, 200, 'Liste des techniciens actifs récupérée.', techniciens);
});

const getUser = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const user = await userService.getUserById(id);
  return sendSuccess(res, 200, 'Utilisateur récupéré.', user);
});

const createUser = asyncHandler(async (req, res) => {
  const payload = validateCreateUser(req.body);
  const user = await userService.createUser(payload);
  return sendSuccess(res, 201, 'Utilisateur créé avec succès.', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateUpdateUser(req.body);
  const user = await userService.updateUser(id, payload);
  return sendSuccess(res, 200, 'Utilisateur mis à jour avec succès.', user);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const { actif } = validateStatusFlag(req.body);
  const user = await userService.updateUserStatus(id, actif, req.user.id);
  const message = actif
    ? 'Compte utilisateur activé avec succès.'
    : 'Compte utilisateur désactivé avec succès.';
  return sendSuccess(res, 200, message, user);
});

module.exports = {
  listUsers,
  listTechniciens,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
};
