const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);

// Route dédiée aux listes déroulantes d'affectation (admin et employe)
router.get('/techniciens', authorize('admin', 'employe'), userController.listTechniciens);

// Gestion complète des comptes réservée à l'administrateur
router.get('/', authorize('admin'), userController.listUsers);
router.get('/:id', authorize('admin'), userController.getUser);
router.post('/', authorize('admin'), userController.createUser);
router.put('/:id', authorize('admin'), userController.updateUser);
router.put('/:id/status', authorize('admin'), userController.updateUserStatus);

module.exports = router;
