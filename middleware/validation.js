const validator = require('../heplers/validate');
const { ObjectId } = require('mongodb');
//Use AI for this part
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

const saveBook = (req, res, next) => {
  const validationRule = {
    name: 'required|string|min:1|max:255',
    author: 'required|string|min:1|max:255',
    genreId: 'required|string',
    isbn: 'required|string|min:10|max:13',
    isOnLoan: 'boolean',
    activeLoanId: 'string'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const saveUser = (req, res, next) => {
  const validationRule = {
    name: 'required|string|min:1|max:255',
    email: 'required|email',
    role: 'required|string|in:admin,member'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const saveLoan = (req, res, next) => {
  const validationRule = {
    bookId: 'required|string',
    userId: 'required|string',
    loanDate: 'required|date',
    dueDate: 'required|date',
    returnDate: 'date',
    status: 'required|string|min:1|max:50'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const saveGenre = (req, res, next) => {
  const validationRule = {
    name: 'required|string|min:1|max:100',
    description: 'string|max:500'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const saveMovie = (req, res, next) => {
  const validationRule = {
    title: 'required|string|min:1|max:100',
    releaseYear: 'required|integer|min:1888|max:2030',
    genre: 'required|array',
    directorName: 'required|string',
    castNames: 'array',
    runtime: 'required|numeric|min:1',
    plotSummary: 'required|string|min:10|max:500'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const saveDirector = (req, res, next) => {
  const validationRule = {
    name: 'required|string|min:2',
    bio: 'required|string|min:5',
    nationality: 'required|string',
    awards: 'array'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

module.exports = { validateObjectId, saveBook, saveUser, saveLoan, saveGenre, saveMovie, saveDirector };