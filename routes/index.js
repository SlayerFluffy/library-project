var express = require("express");
var router = express.Router();
var indexController = require("../controllers/indexController");

router.use("/", require("./swagger"));

router.get("/", indexController.getHomePage);

router.use("/books", require("./books"));
router.use("/users", require("./users"));

router.get ('/login', passport.authenticate('github'), (req, res) => {});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
module.exports = router;
// o
