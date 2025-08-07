/**
 * Format paginated response
 * @param {Array} data - The data rows
 * @param {Object} options - Pagination options
 * @param {number} options.total - Total number of records
 * @param {number} options.page - Current page
 * @param {number} options.limit - Items per page
 */
function formatPaginatedResponse(data, { total, page, limit }) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  formatPaginatedResponse,
};