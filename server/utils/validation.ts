import { body, ValidationChain } from 'express-validator';

export const validateCustomer: ValidationChain[] = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
];

export const validateEmployee: ValidationChain[] = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
];

export const validateTechnicianServiceType: ValidationChain[] = [
  body('lead_employees_id').isInt().withMessage('Lead employee ID must be an integer'),
  body('service_type_id').isInt().withMessage('Service type ID must be an integer'),
];

export const validateServiceOrder: ValidationChain[] = [
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('service_type_id').isInt().withMessage('Service Type ID must be an integer'),
  body('lead_employees_id').optional().isInt().withMessage('Lead Employee ID must be an integer'),
  // Add more validations here as needed
];
