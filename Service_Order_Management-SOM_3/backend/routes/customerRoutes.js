const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const { auth }            = require('../middleware/auth');
const { validateCustomer }= require('../utils/validation');

// GET /api/customers? page,limit,sortBy,order,q,tags
router.get('/', auth, customerController.getAllCustomers);
router.get('/:customer_id', auth, customerController.getCustomerById);
router.post('/', auth, validateCustomer, customerController.createCustomer);
router.put('/:customer_id', auth, validateCustomer, customerController.updateCustomer);
router.delete('/:customer_id', auth, customerController.deleteCustomer);

module.exports = router;
