const express = require('express');
const router = express.Router();
const home = require('../dashboardController/HomeDashboard');
const { auth } = require('../middleware/auth'); // Optional: Authentication middleware




router.get('/', home.getDashboard);


module.exports = router;