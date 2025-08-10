const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const { auth } = require('../middleware/auth');


router.get('/', auth, employeeController.getAllEmployees);
router.get('/:employee_id', auth, employeeController.getEmployeeById);
router.post('/', auth, employeeController.createEmployee);
router.put('/:employee_id', auth, employeeController.updateEmployee);
router.delete('/:employee_id', auth, employeeController.deleteEmployee);

module.exports = router;
