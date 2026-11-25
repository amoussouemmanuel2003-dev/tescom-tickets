const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateRegister,
  validateLogin,
  validateUpdateMe,
} = require('../validators/authValidator');

const register = asyncHandler(async (req, res) => {
  const payload = validateRegister(req.body);
  const result = await authService.registerClient(payload);
  return sendSuccess(res, 201, 'Inscription réussie.', result);
});

const login = asyncHandler(async (req, res) => {
  const payload = validateLogin(req.body);
  const result = await authService.login(payload);
  return sendSuccess(res, 200, 'Connexion réussie.', result);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, 200, 'Profil récupéré avec succès.', user);
});

const updateMe = asyncHandler(async (req, res) => {
  const payload = validateUpdateMe(req.body);
  const updated = await authService.updateMe(req.user.id, payload);
  return sendSuccess(res, 200, 'Profil mis à jour avec succès.', updated);
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};
