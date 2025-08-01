// controllers/authController.js
const jwt = require('jsonwebtoken');

const admin = {
  email: "israel@gmail.com",
  password: "admin123",
  username: "israel",
  userid: "1",
  role: "admin"
};

exports.login = (req, res) => {

if (!req.body) {
  return res.status(400).json({ error: "Bad request", message: "email and password are required" });
}

const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({ error: "Bad request", message: "email and password are required" });
}

if (email === admin.email && password === admin.password) {
    const token = jwt.sign({ username: admin.username, userid: admin.userid, is_admin: true }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    return res.status(200).json({
      message: "Login successful",
      token,
      username: admin.username,
      userid: admin.userid,
      role: admin.role
    });
  }

  return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
};

exports.checkUser = (req, res) => {
  return res.status(200).json({
    message: "Valid user",
    username: req.user.username,
    userid: req.user.userid,
    is_admin: req.user.is_admin
  });
};
