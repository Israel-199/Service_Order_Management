import express from 'express';
import customerController from '../controllers/customer';

const router = express.Router();

router.get('/', customerController.getAllCustomers.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.post('/', customerController.createCustomer.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

// Add other filter routes as needed

export default router;
