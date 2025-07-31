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


module.exports = { validateCustomer, validateEmployee };