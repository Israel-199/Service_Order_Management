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

module.exports = { validateCustomer, validateEmployee, validateTechnicianServiceType };