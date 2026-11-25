const express = require('express');
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);

router.get('/', authorize('admin', 'employe'), clientController.listClients);
router.get('/:id', authorize('admin', 'employe', 'client'), clientController.getClient);
router.post('/', authorize('admin', 'employe'), clientController.createClient);
router.put('/:id', authorize('admin', 'employe'), clientController.updateClient);
router.put('/:id/status', authorize('admin', 'employe'), clientController.updateClientStatus);

module.exports = router;
