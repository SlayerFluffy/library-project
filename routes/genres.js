const express = require('express');
const router = express.Router();
const controller = require('../controllers/genresController');
const validation = require('../middleware/validation');
const { isAuthenticated } = require("../middleware/authenticate");

router.get('/', controller.getAllGenres);
router.get('/:id', validation.validateObjectId, controller.getGenreById);
router.post('/',isAuthenticated, validation.saveGenre, controller.createGenre);
router.put('/:id', isAuthenticated, validation.validateObjectId, validation.saveGenre, controller.updateGenre);
router.delete('/:id', isAuthenticated,validation.validateObjectId, controller.deleteGenre);

module.exports = router;
