const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");

const { isAuthenticated } = require("../middleware/authenticate");
const validation = require('../middleware/validation');

// isAuthenticated (ADD IN POST, PUT, DELETE)

router.get("/", booksController.getAllBooks);
router.get("/:id", validation.validateObjectId, booksController.getBookById);
router.post("/", isAuthenticated,validation.saveBook, booksController.createBook);
router.put("/:id", validation.validateObjectId, isAuthenticated,validation.saveBook,booksController.updateBook);
router.delete("/:id", validation.validateObjectId, isAuthenticated, booksController.deleteBook);

module.exports = router;
