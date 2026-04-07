const { ObjectId } = require('mongodb');
const mongodb = require('../data/database');

// GET ALL USERS
const getAll = async (req, res) => {
  /*#swagger.tags = ['Users']*/
  try {
    const db = mongodb.getDatabase();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET SINGLE USER
const getSingle = async (req, res) => {
  /*#swagger.tags = ['Users']*/
  try {
    const db = mongodb.getDatabase();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID format' });
  }
};

// CREATE USER (AUTO-ID)
const createUser = async (req, res) => {
  /*#swagger.tags = ['Users']*/
  try {
    const db = mongodb.getDatabase();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Body is required' });
    }

    // Do NOT accept _id from client
    const { _id, ...userData } = req.body;

    const result = await db.collection('users').insertOne(userData);

    res.status(201).json({
      _id: result.insertedId,
      ...userData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  /*#swagger.tags = ['Users']*/
  try {
    const db = mongodb.getDatabase();
    const userId = new ObjectId(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Body is required' });
    }

    const { _id, ...updateFields } = req.body; // prevent _id overwrite

    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: { _id: userId, ...updateFields }
    });

  } catch (error) {
    res.status(500).json({ message: 'Invalid ID format' });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  /*#swagger.tags = ['Users']*/
  try {
    const db = mongodb.getDatabase();
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Invalid ID format' });
  }
};

module.exports = { getAll, getSingle, createUser, updateUser, deleteUser };
