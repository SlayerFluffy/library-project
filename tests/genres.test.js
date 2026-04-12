const request = require('supertest');
const express = require('express');

jest.mock('../data/database', () => ({
  getDatabase: jest.fn()
}));

const { getDatabase } = require('../data/database');
const genresController = require('../controllers/genresController');

const app = express();
app.use(express.json());
app.get('/genres', genresController.getAllGenres);
app.get('/genres/:id', genresController.getGenreById);
app.post('/genres', genresController.createGenre);
app.put('/genres/:id', genresController.updateGenre);
app.delete('/genres/:id', genresController.deleteGenre);

const FAKE_GENRES = [
  {
    _id: '6650a1b2c3d4e5f6a7b8c9d0',
    name: 'Fantasy',
    description: 'Fantasy books'
  },
  {
    _id: '6650a1b2c3d4e5f6a7b8c9d1',
    name: 'Sci-Fi',
    description: 'Science Fiction'
  }
];

const FAKE_GENRE = FAKE_GENRES[0];
const VALID_ID   = '6650a1b2c3d4e5f6a7b8c9d0'; // 24-char hex — valid ObjectId
const INVALID_ID = 'invalid-id';

const mockCollection = (overrides = {}) => ({
  find: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue(FAKE_GENRES)
  }),
  findOne: jest.fn().mockResolvedValue(FAKE_GENRE),
  insertOne: jest.fn().mockResolvedValue({ insertedId: VALID_ID }),
  updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  ...overrides
});

describe('GET /genres', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns all genres', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get('/genres');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('200 — returns empty array', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        })
    });

    const res = await request(app).get('/genres');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('500 — database error', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockRejectedValue(new Error('DB error'))
          })
        })
    });

    const res = await request(app).get('/genres');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /genres/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — returns genre', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).get(`/genres/${VALID_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Fantasy' });
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () => mockCollection({ findOne: jest.fn().mockResolvedValue(null) })
    });

    const res = await request(app).get(`/genres/${VALID_ID}`);

    expect(res.status).toBe(404);
  });

  test('500 — invalid ID', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          findOne: jest.fn().mockRejectedValue(new Error('Invalid ObjectId'))
        })
    });

    const res = await request(app).get(`/genres/${INVALID_ID}`);

    expect(res.status).toBe(500);
  });
});

describe('POST /genres', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 — creates genre', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app)
      .post('/genres')
      .send({ name: 'Horror', description: 'Scary books' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});

describe('PUT /genres/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — updates genre', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app)
      .put(`/genres/${VALID_ID}`)
      .send({ name: 'Drama' });

    expect(res.status).toBe(200);
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 })
        })
    });

    const res = await request(app)
      .put(`/genres/${VALID_ID}`)
      .send({ name: 'Drama' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /genres/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — deletes genre', async () => {
    getDatabase.mockReturnValue({ collection: () => mockCollection() });

    const res = await request(app).delete(`/genres/${VALID_ID}`);

    expect(res.status).toBe(200);
  });

  test('404 — not found', async () => {
    getDatabase.mockReturnValue({
      collection: () =>
        mockCollection({
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
        })
    });

    const res = await request(app).delete(`/genres/${VALID_ID}`);

    expect(res.status).toBe(404);
  });
});