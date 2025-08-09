// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');

// GET /notifications

router.get('/', notificationController.getNotifications);
router.post('/mark-read', notificationController.markAsRead);

//router.post('/:id/read', notificationController.markNotificationAsRead);

module.exports = router;
