var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

router.use('/', require('./swagger')); 

router.get('/', indexController.getHomePage);

router.use('/books', require('./books'));
router.use('/users', require('./users'));

module.exports = router;
