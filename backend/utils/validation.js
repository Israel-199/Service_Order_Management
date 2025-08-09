const { body } = require('express-validator');

const validateCustomer = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
];

const validateEmployee = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
];

const validateTechnicianServiceType = [
  body('lead_employees_id').isInt().withMessage('Lead employee ID must be an integer'),
  body('service_type_id').isInt().withMessage('Service type ID must be an integer'),
];
const validateServiceOrder = [
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('service_type_id').isInt().withMessage('Service Type ID must be an integer'),
  body('lead_employees_id').optional().isInt().withMessage('Lead Employee ID must be an integer'),
  // add more validations as needed
];
module.exports = { validateCustomer, validateEmployee, validateTechnicianServiceType, validateServiceOrder };