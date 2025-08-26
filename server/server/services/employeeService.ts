import { Model } from "sequelize";
import { db } from "../models/index";
import type { EmployeeAttributes, EmployeeCreationAttributes } from "../models/employee";
//import { ServiceType } from "../models/serviceType";
//import { ServiceOrder } from "../models/serviceOrder";
//import { ServiceOrderAssignment } from "../models/serviceOrderAssignment";
import {
  parsePagination,
  QueryParams,
  PaginationResult,
} from "../utils/pagination";
import { buildSearchCondition } from "../utils/search";
import { Op, WhereOptions } from "sequelize";

// Define an EmployeeInstance type that represents an instance of Employee model
type EmployeeInstance = Model<EmployeeAttributes, EmployeeCreationAttributes> & EmployeeAttributes;

interface EmployeeWithId extends Omit<EmployeeAttributes, "employee_id"> {
  id: number;
}

class EmployeeService {
  async createEmployee(data: EmployeeCreationAttributes): Promise<EmployeeInstance> {
    if (!data.name) {
      throw new Error("Employee name is required");
    }
    return await db.Employee.create(data);
  }

  async updateEmployee(
    id: number,
    data: Partial<EmployeeAttributes>
  ): Promise<EmployeeInstance> {
    const employee = await db.Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    return await employee.update(data);
  }

  async deleteEmployee(id: number): Promise<{ message: string }> {
    const employee = await db.Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    await employee.destroy();
    return { message: "Employee deleted successfully" };
  }

  async getAllEmployees(query: QueryParams): Promise<PaginationResult<EmployeeInstance>> {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);

    const search = query.search || query.q || null;
    const whereClause: WhereOptions = search
      ? buildSearchCondition(
          ["name", "email", "phone", "specification"],
          search
        )
      : {};

    const { rows: employees, count: total } = await db.Employee.findAndCountAll({
      where: whereClause,
      attributes: [
        ["employee_id", "id"],
        "name",
        "email",
        "phone",
        "status",
        "specification",
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      items: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeesByServiceTypeId(
    serviceTypeId: number,
    queryParams: QueryParams = {}
  ): Promise<PaginationResult<EmployeeInstance>> {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(queryParams);

    const { count, rows } = await db.Employee.findAndCountAll({
      include: [
        {
          model: db.ServiceType as any,
          where: { service_type_id: serviceTypeId },
          through: { attributes: [] },
          required: true,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      items: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getEmployeeById(id: number): Promise<EmployeeInstance | null> {
    return await db.Employee.findByPk(id, {
      attributes: [
        ["employee_id", "id"],
        "name",
        "email",
        "phone",
        "status",
        "specification",
      ],
    });
  }

  async getEmployeeByEmail(email: string): Promise<EmployeeInstance | null> {
    return await db.Employee.findOne({
      where: {
        email: {
          [Op.like]: `%${email}%`,
        },
      },
      attributes: [
        ["employee_id", "id"],
        "name",
        "email",
        "phone",
        "status",
        "specification",
      ],
    });
  }

  async getEmployeeByPhone(phone: string): Promise<EmployeeInstance | null> {
    return await db.Employee.findOne({
      where: { phone },
      attributes: [
        ["employee_id", "id"],
        "name",
        "email",
        "phone",
        "status",
        "specification",
      ],
    });
  }

  async getEmployeeByName(name: string): Promise<EmployeeInstance[]> {
    return await db.Employee.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: [
        ["employee_id", "id"],
        "name",
        "email",
        "phone",
        "status",
        "specification",
      ],
    });
  }
}

export default new EmployeeService();
