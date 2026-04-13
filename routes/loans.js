const express = require('express');
const router = express.Router();
const controller = require('../controllers/loansController');
const validation = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', controller.getAllLoans);
router.get('/:id', controller.getLoanById);
router.post('/', isAuthenticated, validation.saveLoan, controller.createLoan);
router.put('/:id', isAuthenticated, validation.saveLoan, controller.updateLoan);
router.delete('/:id', isAuthenticated, controller.deleteLoan);

module.exports = router;