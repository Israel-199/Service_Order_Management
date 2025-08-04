const express = require('express');
const router = express.Router();
const serviceOrderItemController = require('../controllers/serviceOrderItem');
const { auth } = require('../middleware/auth');


// GET /api/service-orders/:order_id/items
router.get('/service-orders/:order_id/items', serviceOrderItemController.getItemsByServiceOrderId);

// GET /api/service-types/:service_type_id/items
router.get('/service-types/:service_type_id/items', serviceOrderItemController.getItemsByServiceTypeId);

module.exports = router;
