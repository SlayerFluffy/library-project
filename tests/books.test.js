const request = require('supertest');
const express = require('express');

jest.mock('../data/database', () => ({
  getDatabase: jest.fn()
}));

const { getDatabase } = require('../data/database');

const booksController = require('../controllers/booksController');

const app = express();
app.use(express.json());
app.get('/books', booksController.getAllBooks);
app.get('/books/:id', booksController.getBookById);

const FAKE_BOOKS = [
  {
    _id: '6650a1b2c3d4e5f6a7b8c9d0',
    name: 'Clean Code',
    author: 'Robert C. Martin',
    genreId: 'g1',
    isbn: '9780132350884',
    isOnLoan: false,
    activeLoanId: null
  },
  {
    _id: '6650a1b2c3d4e5f6a7b8c9d1',
    name: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    genreId: 'g2',
    isbn: '9780201616224',
    isOnLoan: true,
    activeLoanId: 'loan123'
  }
];

const FAKE_BOOK = FAKE_BOOKS[0];
const VALID_ID   = '6650a1b2c3d4e5f6a7b8c9d0'; 
const INVALID_ID = 'not-an-objectid';

const mockCollection = (overrides = {}) => ({
  find:    jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(FAKE_BOOKS) }),
  findOne: jest.fn().mockResolvedValue(FAKE_BOOK),
  ...overrides
});

describe('GET /books', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns all books as JSON array', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: 'Clean Code', author: 'Robert C. Martin' });
  });

  test('200 — returns an empty array when there are no books', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
      })
    });

    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('500 — returns error when database throws', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB failure'))
        })
      })
    });

    const res = await request(app).get('/books');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch books');
  });

  test('500 — returns error when getDatabase itself throws', async () => {
    getDatabase.mockImplementation(() => { throw new Error('Not initialized'); });

    const res = await request(app).get('/books');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch books');
  });
});

describe('GET /books/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns the correct book for a valid id', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get(`/books/${VALID_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Clean Code', isbn: '9780132350884' });
  });

  test('404 — returns error when book is not found', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({ findOne: jest.fn().mockResolvedValue(null) })
    });

    const res = await request(app).get(`/books/${VALID_ID}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Book not found');
  });

  test('500 — returns error for an invalid ObjectId format', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({
        findOne: jest.fn().mockRejectedValue(new Error('BSONError: invalid id'))
      })
    });

    const res = await request(app).get(`/books/${INVALID_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('500 — returns error when database throws on findOne', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({
        findOne: jest.fn().mockRejectedValue(new Error('DB failure'))
      })
    });

    const res = await request(app).get(`/books/${VALID_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});