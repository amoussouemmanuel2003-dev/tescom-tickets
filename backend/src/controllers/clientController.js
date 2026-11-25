const clientService = require('../services/clientService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { parsePositiveInt } = require('../validators/common');
const { validateClientPayload } = require('../validators/clientValidator');
const { validateStatusFlag } = require('../validators/userValidator');

const listClients = asyncHandler(async (req, res) => {
  const clients = await clientService.listClients(req.query);
  return sendSuccess(res, 200, 'Liste des clients récupérée.', clients);
});

const getClient = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const client = await clientService.getClientById(id, req.user);
  return sendSuccess(res, 200, 'Fiche client récupérée.', client);
});

const createClient = asyncHandler(async (req, res) => {
  const payload = validateClientPayload(req.body);
  const client = await clientService.createClient(payload);
  return sendSuccess(res, 201, 'Client créé avec succès.', client);
});

const updateClient = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateClientPayload(req.body);
  const client = await clientService.updateClient(id, payload);
  return sendSuccess(res, 200, 'Fiche client mise à jour avec succès.', client);
});

const updateClientStatus = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const { actif } = validateStatusFlag(req.body);
  const client = await clientService.updateClientStatus(id, actif);
  const message = actif
    ? 'Compte utilisateur du client activé avec succès.'
    : 'Compte utilisateur du client désactivé avec succès.';
  return sendSuccess(res, 200, message, client);
});

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  updateClientStatus,
};
