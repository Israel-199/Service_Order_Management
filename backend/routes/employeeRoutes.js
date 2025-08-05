const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const { auth }            = require('../middleware/auth');
const { validateEmployee } = require('../utils/validation');

// POST /api/employees
// GET /api/employees? page,limit,sortBy,order,q
router.get('/', employeeController.getAllEmployees);
// GET /api/employees/:employee_id
// GET /api/employees/:employee_id? name, email, phone, specification
router.get('/:employee_id', employeeController.getEmployeeById);

// POST /api/employees
// POST /api/employees? name, email, phone, specification
router.post('/',validateEmployee, employeeController.createEmployee );
router.put('/:employee_id', validateEmployee, employeeController.updateEmployee);
router.get('/email/:email', employeeController.getEmployeeByEmail);
router.get('/phone/:phone', employeeController.getEmployeeByPhone);
router.get('/name/:name', employeeController.getEmployeeByName);
router.delete('/:employee_id', employeeController.deleteEmployee);



// == Additional ==
// GET /api/employees/by-service-type/:service_type_id
router.get('/by-service-type/:service_type_id', employeeController.getEmployeesByServiceTypeId);

// GET /api/employees/by-service-order/:service_order_id
router.get('/by-service-order/:service_order_id', employeeController.getEmployeesByServiceOrderId);

module.exports = router;
