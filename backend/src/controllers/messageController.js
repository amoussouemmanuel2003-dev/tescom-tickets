const messageService = require('../services/messageService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { parsePositiveInt } = require('../validators/common');
const { validateCreateMessage } = require('../validators/messageValidator');

const listMessages = asyncHandler(async (req, res) => {
  const ticketId = parsePositiveInt(req.params.ticketId, 'ticketId');
  const messages = await messageService.listMessages(ticketId, req.user);
  return sendSuccess(res, 200, 'Messages récupérés.', messages);
});

const createMessage = asyncHandler(async (req, res) => {
  const ticketId = parsePositiveInt(req.params.ticketId, 'ticketId');
  const payload = validateCreateMessage(req.body);
  const message = await messageService.createMessage(ticketId, payload, req.user);
  return sendSuccess(res, 201, 'Message ajouté avec succès.', message);
});

module.exports = {
  listMessages,
  createMessage,
};
