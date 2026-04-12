const request = require('supertest');
const express = require('express');

jest.mock('../data/database', () => ({
  getDatabase: jest.fn()
}));

const { getDatabase } = require('../data/database');
const loansController = require('../controllers/loansController');

const app = express();
app.use(express.json());
app.get('/loans', loansController.getAllLoans);
app.get('/loans/:id', loansController.getLoanById);
app.post('/loans', loansController.createLoan);
app.put('/loans/:id', loansController.updateLoan);
app.delete('/loans/:id', loansController.deleteLoan);

const FAKE_LOANS = [
  {
    _id: '6650a1b2c3d4e5f6a7b8k9d0',
    bookId: 'b1',
    userId: 'u1',
    loanDate: '2024-01-01',
    dueDate: '2024-01-10',
    returnDate: null,
    status: 'active'
  }
];

const FAKE_LOAN = FAKE_LOANS[0];
const VALID_ID = '6650a1b2c3d4e5f6a7b8k9d0'; // 24-char hex — valid ObjectId
const INVALID_ID = 'not-valid';

const mockCollection = (overrides = {}) => ({
  find: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue(FAKE_LOANS)
  }),
  findOne: jest.fn().mockResolvedValue(FAKE_LOAN),
  insertOne: jest.fn().mockResolvedValue({ insertedId: VALID_ID }),
  updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  ...overrides
});

beforeEach(() => jest.clearAllMocks());

describe('GET /loans', () => {
  test('200 — returns all loans', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get('/loans');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('500 — DB error', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockRejectedValue(new Error())
          })
        })
    });

    const res = await request(app).get('/loans');
    expect(res.status).toBe(500);
  });
});

describe('GET /loans/:id', () => {
  test('200 — returns loan', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get(`/loans/${VALID_ID}`);
    expect(res.status).toBe(200);
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({ findOne: jest.fn().mockResolvedValue(null) })
    });

    const res = await request(app).get(`/loans/${VALID_ID}`);
    expect(res.status).toBe(404);
  });

  test('500 — invalid ID', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          findOne: jest.fn().mockRejectedValue(new Error())
        })
    });

    const res = await request(app).get(`/loans/${INVALID_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('POST /loans', () => {
  test('201 — creates loan', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app)
      .post('/loans')
      .send({
        bookId: 'b1',
        userId: 'u1',
        loanDate: '2024-01-01',
        dueDate: '2024-01-10',
        status: 'active'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });

  test('500 — create error', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          insertOne: jest.fn().mockRejectedValue(new Error())
        })
    });

    const res = await request(app).post('/loans').send({});
    expect(res.status).toBe(500);
  });
});

describe('PUT /loans/:id', () => {
  test('200 — updates loan', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app)
      .put(`/loans/${VALID_ID}`)
      .send({ status: 'returned' });

    expect(res.status).toBe(200);
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 })
        })
    });

    const res = await request(app).put(`/loans/${VALID_ID}`).send({});
    expect(res.status).toBe(404);
  });
});

describe('DELETE /loans/:id', () => {
  test('200 — deleted', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).delete(`/loans/${VALID_ID}`);
    expect(res.status).toBe(200);
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
        })
    });

    const res = await request(app).delete(`/loans/${VALID_ID}`);
    expect(res.status).toBe(404);
  });
});