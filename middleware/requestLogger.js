module.exports = function requestLogger(req, res, next) {
  res.locals.requestedAt = new Date().toISOString();
  next();
};
