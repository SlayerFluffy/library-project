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
            _id:(req.params.id)
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

        const { _id, bookId, userId, checkedOutDate, dueByDate, returnDate, status } = req.body;

        if (!_id) {
            return res.status(400).json({ error: '_id is required (e.g., L001)' });
        }
        const newLoan = {
            _id,
            bookId,
            userId,
            checkedOutDate,
            dueByDate,
            returnDate: returnDate ?? null,
            status
        };
        const existingLoan = await db.collection('loans').findOne({ _id });
        if (existingLoan) {
            return res.status(409).json({ error: 'Loan with this ID already exists' });
        }
        await db.collection('loans').insertOne(newLoan);
        res.status(201).json(newLoan);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE LOAN
const updateLoan = async (req, res) => {
    /*#swagger.tags = ['Loans']*/
    try {
        const db = getDatabase();
        const loanId =(req.params.id);

        const {bookId, userId, checkedOutDate, dueByDate, returnDate, status} = req.body; // prevent _id overwrite

        if (!bookId && !userId && !checkedOutDate && !dueByDate && !returnDate && !status) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        const result = await db.collection('loans').updateOne(
            { _id: loanId },
            { $set: {bookId, userId, checkedOutDate, dueByDate, returnDate, status} }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ _id: loanId, bookId, userId, checkedOutDate, dueByDate, returnDate, status });
    }   catch (err) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
};

// DELETE LOAN
const deleteLoan = async (req, res) => {
    try {
        const db = getDatabase();
        const result = await db.collection('loans').deleteOne({
            _id: req.params.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ message: 'Loan deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    getAllLoans,
    getLoanById,
    createLoan,
    updateLoan,
    deleteLoan,
};
