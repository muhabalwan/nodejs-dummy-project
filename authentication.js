function authenticate(req, res, next) {
  console.log("authentication...");
  next();
}

module.exports = authenticate;
