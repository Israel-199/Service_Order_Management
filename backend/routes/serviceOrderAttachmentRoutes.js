// routes/serviceOrderAttachmentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const attachmentCtrl = require('../controllers/attachment');
const { auth } = require('../middleware/auth');

// All routes here are prefixed with /api/service-orders/:order_id/attachments


// The attachment must be associated with the service order specified by :order_id
// POST /api/service-orders/:order_id/attachments
// POST /api/service-orders/:order_id/attachments? file, description
router.post('/', attachmentCtrl.createAttachmentForOrder);

// GET /api/service-orders/:order_id/attachments
// GET /api/service-orders/:order_id/attachments? page, limit, sortBy, order, q
router.get('/', attachmentCtrl.getAllAttachmentsForOrder);

// GET /api/service-orders/:order_id/attachments/:id
router.get('/:id', attachmentCtrl.getAttachmentByIdForOrder);

// PUT /api/service-orders/:order_id/attachments/:id
// PUT /api/service-orders/:order_id/attachments/:id? file, description
router.put('/:id', attachmentCtrl.updateAttachmentForOrder);

// DELETE /api/service-orders/:order_id/attachments/:id
router.delete('/:id', attachmentCtrl.deleteAttachmentForOrder);

module.exports = router;