exports.getHomePage = function(req, res) {
  res.sendFile('index.html', { root: req.app.get('views') });
};
