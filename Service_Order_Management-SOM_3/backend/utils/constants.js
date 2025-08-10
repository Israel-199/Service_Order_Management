// utils/constants.js

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = 'created_at';
const DEFAULT_SORT_ORDER = 'ASC';

// Allowed sort orders
const SORT_ORDERS = ['ASC', 'DESC'];

// Error messages
const ERROR_MESSAGES = {
  SERVICE_TYPE_NOT_FOUND: 'Service type not found',
  INVALID_SORT_ORDER: 'Sort order must be ASC or DESC',
  INVALID_ID: 'Invalid ID provided',
};

// Entity names
const ENTITIES = {
  SERVICE_TYPE: 'ServiceType',
  CUSTOMER: 'Customer',
  EMPLOYEE: 'Employee',
};

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  SORT_ORDERS,
  ERROR_MESSAGES,
  ENTITIES,
};
