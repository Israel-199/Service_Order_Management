// controllers/attachment.js
const attachmentService = require('../services/attachmentService');

class AttachmentController {
  // POST /service-orders/:order_id/attachments
  async createAttachmentForOrder(req, res, next) {
    try {
      const orderId = req.params.order_id;
      const data = { ...req.body, order_id: orderId };
      const attachment = await attachmentService.createAttachment(data);
      res.status(201).json({ message: 'Attachment created', attachment });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-orders/:order_id/attachments
  async getAllAttachmentsForOrder(req, res, next) {
    try {
      const orderId = req.params.order_id;
      const result = await attachmentService.getAllAttachments({
        ...req.query,
        order_id: orderId
      });
      res.status(200).json({ message: 'Attachments fetched', ...result });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-orders/:order_id/attachments/:id
  async getAttachmentByIdForOrder(req, res, next) {
    try {
      const { order_id: orderId, id } = req.params;
      const att = await attachmentService.getAttachmentById(id);
      if (!att || att.order_id != orderId) {
        return res.status(404).json({ error: 'Not Found', message: 'Attachment not found for this order' });
      }
      res.json({ message: 'Attachment retrieved', attachment: att });
    } catch (err) {
      next(err);
    }
  }

  // PUT /service-orders/:order_id/attachments/:id
  async updateAttachmentForOrder(req, res, next) {
    try {
      const { order_id: orderId, id } = req.params;
      // Ensure belongs to this order
      const att = await attachmentService.getAttachmentById(id);
      if (!att || att.order_id != orderId) {
        return res.status(404).json({ error: 'Not Found', message: 'Attachment not found for this order' });
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
      const { order_id: orderId, id } = req.params;
      const att = await attachmentService.getAttachmentById(id);
      if (!att || att.order_id != orderId) {
        return res.status(404).json({ error: 'Not Found', message: 'Attachment not found for this order' });
      }
      await attachmentService.deleteAttachment(id);
      res.json({ message: 'Attachment deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AttachmentController();
