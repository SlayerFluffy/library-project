const express = require('express');
const router = express.Router();
const controller = require('../controllers/loansController');

router.get('/', controller.getAllLoans);
router.get('/:id', controller.getLoanById);
router.post('/', controller.createLoan);
router.put('/:id', controller.updateLoan);
router.delete('/:id', controller.deleteLoan);

module.exports = router;
