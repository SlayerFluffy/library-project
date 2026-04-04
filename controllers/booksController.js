const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const getAllBooks = async (req, res) => {
    /*#swagger.tags = ['Books']*/
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        const books = await db.collection('books').find().toArray();
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch books' });
    } finally {
        await client.close();
    }
};

const getBookById = async (req, res) => {
    //#swagger.tags = ['Books']
    const bookId = req.params.id;
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        const book = await db.collection('books').findOne({ _id: bookId });
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch book' });
    } finally {
        await client.close();
    }
};

const createBook = async (req, res) => {
    //#swagger.tags = ['Books']
    const { _id,name, author, genreId, isbn, isOnLoan, activeLoanId } = req.body;
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        if (!_id) {
            return res.status(400).json({ error: 'Book ID is required' });
        }
        const book = {
            _id, name, author, genreId, isbn, isOnLoan: isOnLoan ?? false, activeLoanId: activeLoanId ?? null};
        await db.collection('books').insertOne(book);
        res.status(201).json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create book' });
    } finally {
        await client.close();
    }
};

const updateBook = async (req, res) => {
    //#swagger.tags = ['Books']
    const bookId = req.params.id;
    const { name, author, genreId, isbn, isOnLoan, activeLoanId } = req.body;
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        const result = await db.collection('books').updateOne(  
            { _id: bookId },
            { $set: { name, author, genreId, isbn, ...(isOnLoan !== undefined && { isOnLoan }), ...(activeLoanId !== undefined && { activeLoanId }) } }
        );
        if (result.matchedCount > 0) {
            res.json({ _id: bookId, name, author, genreId, isbn, isOnLoan, activeLoanId });
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update book' });
    } finally {
        await client.close();
    }   
};

const deleteBook = async (req, res) => {
    //#swagger.tags = ['Books']
    const bookId = req.params.id;
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        const result = await db.collection('books').deleteOne({ _id: bookId});
        if (result.deletedCount > 0) {
            res.json({ message: 'Book deleted successfully' });
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete book' });
    } finally {
        await client.close();
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};