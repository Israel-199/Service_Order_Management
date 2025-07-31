// utils/pagination.js

function parsePagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };
}

module.exports = { parsePagination };
