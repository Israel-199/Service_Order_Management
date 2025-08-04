const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceType');
const { auth } = require('../middleware/auth');


// GET /api/service-types? page,limit,sortBy,order,q
router.get('/', serviceTypeController.getAllServiceTypes);

// POST /api/service-types
// POST /api/service-types? name, description
router.post('/', serviceTypeController.createServiceType);

// PUT /api/service-types/:service_type_id
// PUT /api/service-types/:service_type_id? name, description
router.put('/:service_type_id', serviceTypeController.updateServiceType);
// DELETE /api/service-types/:service_type_id
// This route is used to delete a service type by its ID
router.delete('/:service_type_id', serviceTypeController.deleteServiceType);
// Get service types by employee ID with pagination, sorting
router.get('/employee/:employeeId', serviceTypeController.getServiceTypesByEmployeeId);
// Get service types by customer ID with pagination, sorting
router.get('/customer/:customerId', serviceTypeController.getServiceTypesByCustomerId);
// GET /api/service-types/:service_type_id/service-orders

module.exports = router;
