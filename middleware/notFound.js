var createError = require('http-errors');

module.exports = function notFound(req, res, next) {
  next(createError(404));
};
