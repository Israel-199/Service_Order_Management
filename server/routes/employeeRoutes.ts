import express from 'express';
import employeeController from '../controllers/employee';

const router = express.Router();

// Create a new employee
router.post("/", employeeController.createEmployee);

// Update an existing employee
router.put("/:id", employeeController.updateEmployee.bind(employeeController));

// Delete an employee
router.delete("/:id", employeeController.deleteEmployee);

// Get all employees (with pagination & search)
router.get("/", employeeController.getAllEmployees.bind(employeeController));

// Get employees by service type
router.get("/service-type/:serviceTypeId", employeeController.getEmployeesByServiceTypeId);

// Get employee by ID
router.get("/id/:id", employeeController.getEmployeeById);

// Get employee by email
router.get("/email/:email", employeeController.getEmployeeByEmail);

// Get employee by phone
router.get("/phone/:phone", employeeController.getEmployeeByPhone);

// Get employees by name
router.get("/name/:name", employeeController.getEmployeeByName);

export default router;
