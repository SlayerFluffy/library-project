const { ObjectId } = require('mongodb');
const { getDatabase } = require('../data/database');

// GET ALL BOOKS
const getAllBooks = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    try {
        const db = getDatabase();
        const books = await db.collection('books').find().toArray();
        res.json(books);
    }   catch (err) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

// GET BOOK BY ID
const getBookById = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    try {
        const db = getDatabase();
        const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });

        if (!book) return res.status(404).json({ error: 'Book not found' });

        res.json(book);
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// CREATE BOOK (AUTO-ID)
const createBook = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    try {
        const db = getDatabase();

        const { name, author, genreId, isbn, isOnLoan, activeLoanId } = req.body;

        const newBook = {
            name,
            author,
            genreId,
            isbn,
            isOnLoan: isOnLoan ?? false,
            activeLoanId: activeLoanId ?? null
        };

        const result = await db.collection('books').insertOne(newBook);

        res.status(201).json({ _id: result.insertedId, ...newBook });
    }   catch (err) {
        res.status(500).json({ error: 'Failed to create book' });
    }
};

// UPDATE BOOK
const updateBook = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    try {
        const db = getDatabase();
        const bookId = new ObjectId(req.params.id);

        const updateFields = {
            ...req.body
        };

        const result = await db.collection('books').updateOne(
            { _id: bookId },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ _id: bookId, ...updateFields });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    try {
        const db = getDatabase();
        const result = await db.collection('books').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
