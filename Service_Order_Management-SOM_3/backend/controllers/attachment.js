const attachmentService = require('../services/attachmentService');

class AttachmentController {
  // POST /service-orders/:order_id/attachments
  async createAttachmentForOrder(req, res, next) {
    try {
      const { order_id } = req.params;
      const data = { ...req.body, order_id };
      const attachment = await attachmentService.createAttachment(data);
      res.status(201).json({ message: 'Attachment created', attachment });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-orders/:order_id/attachments
  async getAllAttachmentsForOrder(req, res, next) {
    try {
      const { order_id } = req.params;
      const result = await attachmentService.getAllAttachments({
        ...req.query,
        order_id,
      });
      res.status(200).json({ message: 'Attachments fetched', ...result });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-orders/:order_id/attachments/:id
  async getAttachmentByIdForOrder(req, res, next) {
    try {
      const { order_id, id } = req.params;
      const attachment = await attachmentService.getAttachmentById(id);

      if (!attachment || attachment.order_id != order_id) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Attachment not found for this order',
        });
      }

      res.json({ message: 'Attachment retrieved', attachment });
    } catch (err) {
      next(err);
    }
  }

  // PUT /service-orders/:order_id/attachments/:id
  async updateAttachmentForOrder(req, res, next) {
    try {
      const { order_id, id } = req.params;
      const attachment = await attachmentService.getAttachmentById(id);

      if (!attachment || attachment.order_id != order_id) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Attachment not found for this order',
        });
      }

      const updated = await attachmentService.updateAttachment(id, req.body);
      res.json({ message: 'Attachment updated', attachment: updated });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /service-orders/:order_id/attachments/:id
  async deleteAttachmentForOrder(req, res, next) {
    try {
      const { order_id, id } = req.params;
      const attachment = await attachmentService.getAttachmentById(id);

      if (!attachment || attachment.order_id != order_id) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Attachment not found for this order',
        });
      }

      await attachmentService.deleteAttachment(id);
      res.json({ message: 'Attachment deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AttachmentController();
