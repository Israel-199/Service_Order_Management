const express = require('express');
const router = express.Router();
// const authRoutes = require('./authRoutes');
const homeDashboard = require('./homeDashoard');
const analyticsDashboard = require('./analyticsDashboard');

router.use('/home', homeDashboard);
//router.use('/employee', employeeDashboard);
router.use('/analytics', analyticsDashboard);
module.exports = router;