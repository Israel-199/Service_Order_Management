import { Op, Sequelize as SequelizeType, WhereOptions } from 'sequelize';

type SearchFields = string[];

/**
 * Build a Sequelize `where` clause using the provided fields and search query.
 * Now the parameter order is: fields first, then the search query.
 */
export function buildSearchCondition(fields: SearchFields, q: string | undefined): WhereOptions {
  if (!q) return {};
  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.like]: `%${q}%` }
    }))
  };
}

/**
 * Build a Sequelize `where` clause with an explicit Sequelize instance.
 * The parameter order is: fields, then the search query, then Sequelize.
 */
export function buildSearchConditionWithSequelize(
  fields: SearchFields,
  search: string | undefined,
  Sequelize: typeof SequelizeType
): WhereOptions {
  if (!search) return {};
  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.like]: `%${search}%` }
    }))
  };
}

//export const buildSearchConditionWithFieldsAndSequelize = buildSearchConditionWithSequelize;
