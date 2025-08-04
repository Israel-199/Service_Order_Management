const express = require('express');
const router = express.Router();
const analytics = require('../dashboardController/analytics');
const { auth } = require('../middleware/auth'); // Optional: Authentication middleware


router.get('/', analytics.getDashboard);


module.exports = router;