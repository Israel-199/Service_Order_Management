// utils/pagination.ts
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

export function parsePagination(query: PaginationQuery): ParsedPagination {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || "created_at";
  const sortOrder: "ASC" | "DESC" =
    query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };
}

export interface QueryParams extends PaginationQuery {
  search?: string;
  q?: string;
  [key: string]: any;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
