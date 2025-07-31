const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const serviceTypeRoutes = require('./serviceTypeRoutes');
const serviceOrderRoutes = require('./serviceOrderRoutes');
const attachmentRoutes = require('./serviceOrderAttachmentRoutes');
const employeeRoutes = require('./employeeRoutes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/service-types', serviceTypeRoutes);
router.use('/service-orders', serviceOrderRoutes);
router.use('/service-orders/:order_id/attachments', attachmentRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;