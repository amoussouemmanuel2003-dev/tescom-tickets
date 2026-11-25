const ticketService = require('../services/ticketService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { parsePositiveInt } = require('../validators/common');
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateAssignTicket,
  validateStatusChange,
  validateCloseTicket,
} = require('../validators/ticketValidator');

const listTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.listTickets(req.query, req.user);
  return sendSuccess(res, 200, 'Liste des tickets récupérée.', tickets);
});

const getTicket = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const ticket = await ticketService.getTicketById(id, req.user);
  return sendSuccess(res, 200, 'Ticket récupéré.', ticket);
});

const createTicket = asyncHandler(async (req, res) => {
  const payload = validateCreateTicket(req.body, req.user.role);
  const ticket = await ticketService.createTicket(payload, req.user);
  return sendSuccess(res, 201, 'Ticket créé avec succès.', ticket);
});

const updateTicket = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateUpdateTicket(req.body, req.user.role);
  const ticket = await ticketService.updateTicket(id, payload, req.user);
  return sendSuccess(res, 200, 'Ticket mis à jour avec succès.', ticket);
});

const assignTicket = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateAssignTicket(req.body);
  const ticket = await ticketService.assignTicket(id, payload, req.user);
  return sendSuccess(res, 200, 'Technicien affecté avec succès.', ticket);
});

const changeStatus = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateStatusChange(req.body);
  const ticket = await ticketService.changeTicketStatus(id, payload, req.user);
  return sendSuccess(res, 200, 'Statut du ticket mis à jour.', ticket);
});

const closeTicket = asyncHandler(async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'id');
  const payload = validateCloseTicket(req.body);
  const ticket = await ticketService.closeTicket(id, payload, req.user);
  return sendSuccess(res, 200, 'Ticket clôturé avec succès.', ticket);
});

const getHistory = asyncHandler(async (req, res) => {
  const ticketId = parsePositiveInt(req.params.ticketId, 'ticketId');
  const historique = await ticketService.getTicketHistory(ticketId, req.user);
  return sendSuccess(res, 200, 'Historique du ticket récupéré.', historique);
});

module.exports = {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  assignTicket,
  changeStatus,
  closeTicket,
  getHistory,
};
