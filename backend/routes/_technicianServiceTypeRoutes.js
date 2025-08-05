const express = require('express');
const router = express.Router();
const technicianServiceTypeController = require('../controllers/_technicianServiceTypeController');
const { auth } = require('../middleware/auth');
const { validateTechnicianServiceType } = require('../utils/validation');

router.get('/', auth, technicianServiceTypeController.getAllTechnicianServiceTypes);
router.get('/:lead_employees_id/:service_type_id', auth, technicianServiceTypeController.getTechnicianServiceType);
router.post('/', auth, validateTechnicianServiceType, technicianServiceTypeController.createTechnicianServiceType);
router.put('/:lead_employees_id/:service_type_id', auth, validateTechnicianServiceType, technicianServiceTypeController.updateTechnicianServiceType);
router.delete('/:lead_employees_id/:service_type_id', auth, technicianServiceTypeController.deleteTechnicianServiceType);

module.exports = router;