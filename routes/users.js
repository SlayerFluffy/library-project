var express = require('express');
var router = express.Router();
var usersController = require('../controllers/usersController');


router.get('/', usersController.getAll);
router.get('/:id', usersController.getSingle);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
