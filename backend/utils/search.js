// utils/search.js
// Utility functions for building search conditions in Sequelize
const Sequelize = require('sequelize');
const { Op } = Sequelize;

function buildSearchCondition(q, fields) {
  if (!q) return {};
  return {
    [Op.or]: fields.map(field => ({
      [field]: { [Op.like]: `%${q}%` }
    }))
  };
}

/** * Build a Sequelize `where` object for searching
 * with multiple conditions.
 * @param {string} search - search term
 * @param {Array<string>} fields - model fields to search
 * @param {Object} Sequelize - Sequelize instance
 */
function buildSearchConditionWithSequelize(search, fields, Sequelize) {
  if (!search) return {};
  return {
    [Op.or]: fields.map(field => ({
      [field]: { [Sequelize.Op.like]: `%${search}%` }
    }))
  };
}

module.exports = { buildSearchCondition, buildSearchConditionWithSequelize };
