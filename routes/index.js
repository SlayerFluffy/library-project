var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

router.get('/', indexController.getHomePage);

router.use('/books', require('./books'));

module.exports = router;
