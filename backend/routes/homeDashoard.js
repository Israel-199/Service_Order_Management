const express = require('express');
const router = express.Router();
const home = require('../dashboardController/HomeDashboard');


router.get('/', home.getDashboard);


module.exports = router;