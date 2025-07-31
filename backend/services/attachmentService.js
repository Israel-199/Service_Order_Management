// services/attachmentService.js
const { Attachment, ServiceOrder } = require('../models');
const { Op } = require('sequelize');
const { parseQueryParams } = require('../utils/pagination');
const { parsePagination } = require('../utils/pagination');

class AttachmentService {
  static allowedTypes = ['image', 'document', 'audio'];

  async createAttachment(data) {
    // data.order_id comes from URL param
    if (!data.order_id) {
      const err = new Error('order_id is required');
      err.statusCode = 400;
      throw err;
    }
    const order = await ServiceOrder.findByPk(data.order_id);
    if (!order) {
      const err = new Error('Service order not found');
      err.statusCode = 404;
      throw err;
    }
    if (!data.file_type) data.file_type = 'document';
    else if (!AttachmentService.allowedTypes.includes(data.file_type)) {
      const err = new Error(`Invalid file_type. Allowed: ${AttachmentService.allowedTypes.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    return Attachment.create(data);
  }

  async getAllAttachments(query) {
/**     const {
      limit,
      offset,
      sortBy = 'order_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    **/
    const { limit, offset, sortBy, sortOrder, search } = parseQueryParams(query);
    const where = { order_id: query.order_id };
    if (query.file_type) where.file_type = query.file_type;
    if (search) where.file_path = { [Op.like]: `%${search}%` };

    const { rows, count } = await Attachment.findAndCountAll({
      where,
      attributes: ['attachment_id','order_id','file_path','file_type','uploaded_at'],
      order: [[sortBy, sortOrder]],
      limit, offset
    });
    return {
      meta: { page: Math.floor(offset/limit)+1, pageSize: limit, totalItems: count, totalPages: Math.ceil(count/limit) },
      data: rows
    };
  }

  async getAttachmentById(id) {
    return Attachment.findByPk(id);
  }

  async updateAttachment(id, data) {
    const att = await Attachment.findByPk(id);
    if (!att) {
      const err = new Error('Attachment not found');
      err.statusCode = 404;
      throw err;
    }
    if (data.file_type && !AttachmentService.allowedTypes.includes(data.file_type)) {
      const err = new Error(`Invalid file_type. Allowed: ${AttachmentService.allowedTypes.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    return att.update(data);
  }

  async deleteAttachment(id) {
    const att = await Attachment.findByPk(id);
    if (!att) {
      const err = new Error('Attachment not found');
      err.statusCode = 404;
      throw err;
    }
    await att.destroy();
  }
}

module.exports = new AttachmentService();
