// routes/serviceOrderAttachmentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const attachmentCtrl = require('../controllers/attachment');
const { auth } = require('../middleware/auth');

// All routes here are prefixed with /api/service-orders/:order_id/attachments

// Create a new attachment for this order
router.post('/', auth, attachmentCtrl.createAttachmentForOrder);

// List attachments for this order (with pagination/search/sort)
router.get('/', auth, attachmentCtrl.getAllAttachmentsForOrder);

// Get a single attachment by its ID (must belong to this order)
router.get('/:id', auth, attachmentCtrl.getAttachmentByIdForOrder);

// Update an attachment (must belong to this order)
router.put('/:id', auth, attachmentCtrl.updateAttachmentForOrder);

// Delete an attachment (must belong to this order)
router.delete('/:id', auth, attachmentCtrl.deleteAttachmentForOrder);

module.exports = router;