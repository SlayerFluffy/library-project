const { ObjectId } = require('mongodb');
const { getDatabase } = require('../data/database');

// GET ALL LOANS
const getAllLoans = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const loans = await db.collection('loans').find().toArray();
        res.json(loans);
    }   catch (err) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

// GET LOAN BY ID
const getLoanById = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const loan = await db.collection('loans').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        res.json(loan);
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// CREATE LOAN
const createLoan = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const { bookId, userId, loanDate, dueDate, returnDate, status } = req.body;

        const newLoan = {
            bookId,
            userId,
            loanDate,
            dueDate,
            returnDate: returnDate ?? null,
            status
        };

        const result = await db.collection('loans').insertOne(newLoan);

        res.status(201).json({ _id: result.insertedId, ...newLoan });
    }   catch (err) {
        res.status(500).json({ error: 'Failed to create loan' });
    }
};

// UPDATE LOAN
const updateLoan = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const loanId = new ObjectId(req.params.id);

        const {bookId, userId, loanDate, dueDate, returnDate, status} = req.body; // prevent _id overwrite

        if (!bookId && !userId && !loanDate && !dueDate && !returnDate && !status) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        const result = await db.collection('loans').updateOne(
            { _id: loanId },
            { $set: {bookId, userId, loanDate, dueDate, returnDate, status} }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ _id: loanId, bookId, userId, loanDate, dueDate, returnDate, status });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// DELETE LOAN
const deleteLoan = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const result = await db.collection('loans').deleteOne({
            _id: new ObjectId(req.params.id)
            });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ message: 'Loan deleted successfully' });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

module.exports = {
    getAllLoans,
    getLoanById,
    createLoan,
    updateLoan,
    deleteLoan
};
