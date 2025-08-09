const express = require('express');
const router = express.Router();
// const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const serviceTypeRoutes = require('./serviceTypeRoutes');
const serviceOrderRoutes = require('./serviceOrderRoutes');
const attachmentRoutes = require('./serviceOrderAttachmentRoutes');
const employeeRoutes = require('./employeeRoutes');
const DashboardRoutes = require('./DashboardRoutes'); // Import the service order dashboard routes
const technicianServiceTypeRoutes = require('./_technicianServiceTypeRoutes');
const notificationRoutes = require('./notificationRoutes');

// router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/service-types', serviceTypeRoutes);
router.use('/service-orders', serviceOrderRoutes);
router.use('/service-orders/:order_id/attachments', attachmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboards', DashboardRoutes);
router.use('/notifications', notificationRoutes);




// == Additionals ==

//router.use('/service-order-assignments', require('./serviceOrderAssignmentRoutes'));
//router.use('/service-order-status-history', require('./serviceOrderStatusHistoryRoutes'));
router.use('/technician-service-types', technicianServiceTypeRoutes);
router.use('/service-order-items', require('./serviceOrderItemsRoutes'));


module.exports = router;