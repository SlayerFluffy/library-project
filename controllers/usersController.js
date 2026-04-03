const mongodb = require('../data/database');
const crypto = require('crypto');

const getAll = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const user = await db.collection('users').findOne({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Body is required' });
    }

    const user = {
      ...req.body,
      _id: req.body._id ? req.body._id : crypto.randomUUID()
    };

    const result = await db.collection('users').insertOne(user);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const userId = req.params.id;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Body is required' });
    }

    const updatedUser = {
      ...req.body
    };

    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: updatedUser }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: { _id: userId, ...updatedUser }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();

    const result = await db.collection('users').deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {getAll, getSingle, createUser, updateUser, deleteUser};