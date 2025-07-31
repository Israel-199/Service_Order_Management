const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceType');
const { auth } = require('../middleware/auth');

router.post('/', auth, serviceTypeController.createServiceType);
router.get('/', auth, serviceTypeController.getAllServiceTypes);

module.exports = router;
