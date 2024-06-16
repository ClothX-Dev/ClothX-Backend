const jwt = require("jsonwebtoken");
const secret = require("../secret.json");
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, secret.key);
    req.userData = decodedToken;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
