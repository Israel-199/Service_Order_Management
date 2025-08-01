const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder');

// Protect all service order routes with auth middleware
// GET /api/service-orders
router.get('/', serviceOrderController.getAllServiceOrders);
router.post('/', auth, serviceOrderController.createServiceOrder);
router.put('/:order_id', auth, serviceOrderController.updateServiceOrder);
router.get('/:order_id', auth, serviceOrderController.getServiceOrderById);
router.delete('/:order_id', auth, serviceOrderController.deleteServiceOrder);

module.exports = router;
