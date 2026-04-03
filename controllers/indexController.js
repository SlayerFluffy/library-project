exports.getHomePage = function(req, res) {
  //#swagger.tags = ['Home Page']
  res.sendFile('index.html', { root: req.app.get('views') });
};
