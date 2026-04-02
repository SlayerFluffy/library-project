const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const getAllBooks = async (req, res) => {
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

module.exports = {
    listBooks: getAllBooks
};