var express = require('express');
var router = express.Router();
var usersController = require('../controllers/usersController');
const { isAuthenticated } = require("../middleware/authenticate");
const validation = require('../middleware/validation');


router.get('/', usersController.getAll);
router.get('/:id', validation.validateObjectId, usersController.getSingle);
router.post('/', isAuthenticated, validation.saveUser, usersController.createUser);
router.put('/:id', validation.validateObjectId, isAuthenticated, validation.saveUser, usersController.updateUser);
router.delete('/:id', validation.validateObjectId, isAuthenticated, usersController.deleteUser);

module.exports = router;
