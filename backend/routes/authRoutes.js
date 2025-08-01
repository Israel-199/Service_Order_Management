const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { verifyToken } = require('../middleware/auth');

router.post('/login',  authController.login);
router.get('/checkUser', verifyToken,  authController.checkUser);

module.exports = router;
