var express = require('express');
var router = express.Router();
var usersController = require('../controllers/usersController');
const { isAuthenticated } = require("../middleware/authenticate");


router.get('/', usersController.getAll);
router.get('/:id', usersController.getSingle);
router.post('/', isAuthenticated,usersController.createUser);
router.put('/:id', isAuthenticated, usersController.updateUser);
router.delete('/:id',isAuthenticated, usersController.deleteUser);

module.exports = router;
