const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder');
const { validateServiceOrder } = require('../utils/validation');
// /api/service-orders

console.log('Loaded controller:', serviceOrderController);
router.get('/', serviceOrderController.getAllServiceOrders);
router.post('/',validateServiceOrder, serviceOrderController.createServiceOrder);
router.put('/:order_id', validateServiceOrder, serviceOrderController.updateServiceOrder);
router.get('/:order_id', serviceOrderController.getServiceOrderById);
router.delete('/:order_id', serviceOrderController.deleteServiceOrder);


module.exports = router;
