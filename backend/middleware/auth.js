const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "Unauthorized", message: "Authentication invalid" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(401).json({ error: "Unauthorized", message: "Authentication invalid" });
    req.user = user;
    next();
  });
};

module.exports = { verifyToken };

