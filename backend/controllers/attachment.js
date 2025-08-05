// controllers/attachment.js
const attachmentService = require('../services/attachmentService');

/**
 * AttachmentController handles attachment-related requests for service orders.
 * It includes methods for creating, retrieving, updating, and deleting attachments.
 * Each method interacts with the attachmentService for business logic and returns JSON responses.
 * The controller is used in the attachmentRoutes file to define the routes.
 */
class AttachmentController {

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
