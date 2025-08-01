// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerControllers = require('../controllers/customerControllers');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, customerControllers.getAllCustomers);
router.get('/:customer_id', verifyToken, customerControllers.getCustomerById);
router.post('/', verifyToken, customerControllers.createCustomer);
router.put('/:customer_id', verifyToken, customerControllers.updateCustomer);
router.delete('/:customer_id', verifyToken, customerControllers.deleteCustomer);

module.exports = router;
