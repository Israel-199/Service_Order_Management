const express = require('express');
const router = express.Router();
const analytics = require('../dashboardController/analytics');



router.get('/', analytics.getDashboard);


module.exports = router;