const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.get('/service-order', auth, reportController.getServiceOrderReport);

module.exports = router;