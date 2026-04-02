module.exports = function errorHandler(err, req, res, _next) {
  res.status(err.status || 500);

  if (req.accepts('html')) {
    return res.sendFile('error.html', {
      root: req.app.get('views'),
      headers: {
        'X-Error-Message': err.message,
        'X-Error-Status': String(err.status || 500)
      }
    });
  }

  return res.json({
    message: err.message,
    status: err.status || 500,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  });
};
