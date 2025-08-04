const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder');
// /api/service-orders

router.get('/', serviceOrderController.getAllServiceOrders);
router.post('/', serviceOrderController.createServiceOrder);
router.put('/:order_id', serviceOrderController.updateServiceOrder);
router.get('/:order_id', serviceOrderController.getServiceOrderById);
router.delete('/:order_id', serviceOrderController.deleteServiceOrder);


module.exports = router;
