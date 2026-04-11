const express = require('express');
const router = express.Router();
const controller = require('../controllers/loansController');
const validation = require('../middleware/validation');

router.get('/', controller.getAllLoans);
router.get('/:id', validation.validateObjectId, controller.getLoanById);
router.post('/', validation.saveLoan, controller.createLoan);
router.put('/:id', validation.validateObjectId, validation.saveLoan, controller.updateLoan);
router.delete('/:id', validation.validateObjectId, controller.deleteLoan);

module.exports = router;
