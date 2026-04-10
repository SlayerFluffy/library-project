const express = require('express');
const router = express.Router();
const controller = require('../controllers/genresController');

router.get('/', controller.getAllGenres);
router.get('/:id', controller.getGenreById);
router.post('/', controller.createGenre);
router.put('/:id', controller.updateGenre);
router.delete('/:id', controller.deleteGenre);

module.exports = router;
