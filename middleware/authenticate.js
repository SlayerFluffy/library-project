const isAuthenticated = (req, res, next) => {
  const passportAuthenticated =
    typeof req.isAuthenticated === "function" ? req.isAuthenticated() : false;
  const hasLegacySessionUser = !!(req.session && req.session.user);

  if (!passportAuthenticated && !hasLegacySessionUser) {
    return res.status(401).json("You do not have access");
  }
  next();
};

module.exports = {
  isAuthenticated,
};
