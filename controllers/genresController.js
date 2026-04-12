const { ObjectId } = require('mongodb');
const { getDatabase } = require('../data/database');

// GET ALL GENRES
const getAllGenres = async (req, res) => {
    /*#swagger.tags = ['Genres']*/
    try {
        const db = getDatabase();
        const genres = await db.collection('genres').find().toArray();
        res.json(genres);
    }   catch (err) {
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
};

// GET GENRE BY ID
const getGenreById = async (req, res) => {
    /*#swagger.tags = ['Genres']*/
    try {
        const db = getDatabase();
        const genre = await db.collection('genres').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!genre) return res.status(404).json({ error: 'Genre not found' });

        res.json(genre);
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// CREATE GENRE
const createGenre = async (req, res) => {
    /*#swagger.tags = ['Genres']*/
    try {
        const db = getDatabase();
        const { name, description } = req.body;

        const newGenre = { name, description };

        const result = await db.collection('genres').insertOne(newGenre);

        res.status(201).json({ _id: result.insertedId, ...newGenre });
    }   catch (err) {
        res.status(500).json({ error: 'Failed to create genre' });
    }
};

// UPDATE GENRE
const updateGenre = async (req, res) => {
    /*#swagger.tags = ['Genres']*/
    try {
        const db = getDatabase();
        const genreId = new ObjectId(req.params.id);

        const { name, description } = req.body; // prevent _id overwrite

        if (!name && !description) {
            return res.status(400).json({ message: "At least one field (name or description) is required" });
        }

        const result = await db.collection('genres').updateOne(
            { _id: genreId },
            { $set: { name, description } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.json({ _id: genreId, name, description });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// DELETE GENRE
const deleteGenre = async (req, res) => {
    /*#swagger.tags = ['Genres']*/
    try {
        const db = getDatabase();
        const result = await db.collection('genres').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.json({ message: 'Genre deleted successfully' });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

module.exports = {
    getAllGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre
};
