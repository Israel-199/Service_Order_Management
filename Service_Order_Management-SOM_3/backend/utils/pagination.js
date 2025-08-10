const {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  SORT_ORDERS,
  ERROR_MESSAGES,
} = require('./constants');

function parsePagination(query) {
  const page = parseInt(query.page) || DEFAULT_PAGE;
  const limit = parseInt(query.limit) || DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || DEFAULT_SORT_BY;
  const sortOrder = SORT_ORDERS.includes(query.sortOrder?.toUpperCase())
    ? query.sortOrder.toUpperCase()
    : DEFAULT_SORT_ORDER;

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };
}

module.exports = { parsePagination };
