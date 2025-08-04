const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const { auth }            = require('../middleware/auth');
const { validateCustomer }= require('../utils/validation');


// GET /api/customers
// GET /api/customers? page,limit,sortBy,order,q
router.get('/', customerController.getAllCustomers);
// GET /api/customers/:customer_id
router.get('/:customer_id', customerController.getCustomerById);
// POST /api/customers
// POST /api/customers? name, email, phone, company, address, tin_number
router.post('/', validateCustomer, customerController.createCustomer);
// PUT /api/customers/:customer_id
// PUT /api/customers/:customer_id? name, email, phone, company, address, tin_number
router.put('/:customer_id', validateCustomer, customerController.updateCustomer);
// DELETE /api/customers/:customer_id
router.delete('/:customer_id', customerController.deleteCustomer);


// Field-based GETs
router.get('/:customerId/orders', customerController.getCustomerOrders);
router.get('/name/:name', customerController.getCustomersByName);
router.get('/email/:email', customerController.getCustomersByEmail);
router.get('/phone/:phone', customerController.getCustomersByPhone);
router.get('/company/:company', customerController.getCustomersByCompany);
router.get('/address/:address', customerController.getCustomersByAddress);
router.get('/tin/:tinNumber', customerController.getCustomersByTinNumber);


module.exports = router;
