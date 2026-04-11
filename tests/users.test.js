const request = require('supertest');
const express = require('express');

jest.mock('../data/database', () => ({
  getDatabase: jest.fn()
}));

const mongodb = require('../data/database');

const usersController = require('../controllers/usersController');

const app = express();
app.use(express.json());
app.get('/users', usersController.getAll);
app.get('/users/:id', usersController.getSingle);

const FAKE_USERS = [
  {
    _id: '5f43a0d16d330d08cf3bcd1a',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin'
  },
  {
    _id: '5f43a0d16d330d08cf3bcd1b',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'member'
  }
];

const FAKE_USER  = FAKE_USERS[0];
const VALID_ID   = '5f43a0d16d330d08cf3bcd1a'; // 24-char hex — valid ObjectId
const INVALID_ID = 'not-an-objectid';

const mockCollection = (overrides = {}) => ({
  find:    jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(FAKE_USERS) }),
  findOne: jest.fn().mockResolvedValue(FAKE_USER),
  ...overrides
});

describe('GET /users', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns all users as JSON array', async () => {
    mongodb.getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: 'Alice Johnson', email: 'alice@example.com' });
  });

  test('200 — returns an empty array when there are no users', async () => {
    mongodb.getDatabase.mockReturnValue({
      collection: () => mockCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
      })
    });

    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('500 — returns error when database throws on find', async () => {
    mongodb.getDatabase.mockReturnValue({
      collection: () => mockCollection({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB failure'))
        })
      })
    });

    const res = await request(app).get('/users');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch users');
  });

  test('500 — returns error when getDatabase itself throws', async () => {
    mongodb.getDatabase.mockImplementation(() => { throw new Error('Not initialized'); });

    const res = await request(app).get('/users');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch users');
  });
});

describe('GET /users/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns the correct user for a valid id', async () => {
    mongodb.getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get(`/users/${VALID_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Alice Johnson', email: 'alice@example.com' });
  });

  test('404 — returns error when user is not found', async () => {
    mongodb.getDatabase.mockReturnValue({
      collection: () => mockCollection({ findOne: jest.fn().mockResolvedValue(null) })
    });

    const res = await request(app).get(`/users/${VALID_ID}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  test('500 — returns error for an invalid ObjectId format', async () => {
    mongodb.getDatabase.mockReturnValue({
      collection: () => mockCollection({
        findOne: jest.fn().mockRejectedValue(new Error('BSONError: invalid id'))
      })
    });

    const res = await request(app).get(`/users/${INVALID_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('500 — returns error when database throws on findOne', async () => {
    mongodb.getDatabase.mockReturnValue({
      collection: () => mockCollection({
        findOne: jest.fn().mockRejectedValue(new Error('DB failure'))
      })
    });

    const res = await request(app).get(`/users/${VALID_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});