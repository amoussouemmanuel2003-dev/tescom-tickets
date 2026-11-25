const express = require('express');
const ticketController = require('../controllers/ticketController');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);

router.get('/', ticketController.listTickets);
router.get('/:id', ticketController.getTicket);
router.post('/', authorize('admin', 'employe', 'client'), ticketController.createTicket);
router.put('/:id', authorize('admin', 'employe', 'client'), ticketController.updateTicket);
router.put('/:id/assign', authorize('admin', 'employe'), ticketController.assignTicket);
router.put('/:id/status', authorize('admin', 'employe', 'technicien'), ticketController.changeStatus);
router.put('/:id/close', authorize('admin', 'employe'), ticketController.closeTicket);

// Messages et historique liés à un ticket
router.get('/:ticketId/messages', messageController.listMessages);
router.post('/:ticketId/messages', messageController.createMessage);
router.get('/:ticketId/historique', ticketController.getHistory);

module.exports = router;
