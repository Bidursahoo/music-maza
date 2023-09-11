const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({
      message: "Access denied, no token provided",
    });
  }

  jwt.verify(token, process.env.JWTKEY, (error, validToken) => {
    if (error) {
      console.error("JWT verification error:", error);
      return res.status(401).json({
        message: "Invalid token",
      });
    } else {
      req.user = validToken;
      // console.log(validToken)
      next();
    }
  });
};
