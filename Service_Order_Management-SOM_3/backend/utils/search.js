// utils/search.js

const { Op } = require('sequelize');

/**
 * Build a Sequelize `where` object for text searching
 * across multiple fields.
 * @param {string} q - search term
 * @param {Array<string>} fields - model fields to search
 */
function buildSearchCondition(q, fields) {
  if (!q) return {};
  return {
    [Op.or]: fields.map(field => ({
      [field]: { [Op.like]: `%${q}%` }
    }))
  };
}

module.exports = { buildSearchCondition };
