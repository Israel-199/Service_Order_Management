// services/attachmentService.js
const { Attachment, ServiceOrder } = require('../models');
const { Op } = require('sequelize');
const { parsePagination } = require('../utils/pagination');

class AttachmentService {
  static allowedTypes = ['image', 'document', 'audio'];

  _throwError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  _validateFileType(fileType) {
    if (!AttachmentService.allowedTypes.includes(fileType)) {
      this._throwError(
        `Invalid file_type. Allowed: ${AttachmentService.allowedTypes.join(', ')}`,
        400
      );
    }
  }

  async _getAttachmentOrThrow(id) {
    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      this._throwError('Attachment not found', 404);
    }
    return attachment;
  }

  async createAttachment(data) {
    const { order_id, file_type = 'document' } = data;

    if (!order_id) this._throwError('order_id is required');

    const order = await ServiceOrder.findByPk(order_id);
    if (!order) this._throwError('Service order not found', 404);

    this._validateFileType(file_type);

    return Attachment.create({ ...data, file_type });
  }

  async getAllAttachments(query) {
    const {
      limit,
      offset,
      sortBy = 'order_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const where = { ...(query.order_id && { order_id: query.order_id }) };

    if (query.file_type) where.file_type = query.file_type;
    if (query.search) where.file_path = { [Op.like]: `%${query.search}%` };

    const { rows, count } = await Attachment.findAndCountAll({
      where,
      attributes: [
        'attachment_id',
        'order_id',
        'file_path',
        'file_type',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      meta: {
        page,
        pageSize: limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    };
  }

  async getAttachmentById(id) {
    return Attachment.findByPk(id);
  }

  async updateAttachment(id, data) {
    const att = await this._getAttachmentOrThrow(id);

    if (data.file_type) {
      this._validateFileType(data.file_type);
    }

    return att.update(data);
  }

  async deleteAttachment(id) {
    const att = await this._getAttachmentOrThrow(id);
    await att.destroy();
  }
}

module.exports = new AttachmentService();
