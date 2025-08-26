import { Request, Response } from "express";
import EmployeeService from "../services/employeeService";
import { QueryParams } from "../utils/pagination";

class EmployeeController {
  async createEmployee(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create employee" });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = await EmployeeService.updateEmployee(id, req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(404).json({ message: error.message || "Employee not found" });
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await EmployeeService.deleteEmployee(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message || "Employee not found" });
    }
  }

  async getAllEmployees(req: Request, res: Response) {
    try {
      const query = req.query as unknown as QueryParams;
      const employees = await EmployeeService.getAllEmployees(query);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employees" });
    }
  }

  async getEmployeesByServiceTypeId(req: Request, res: Response) {
    try {
      const serviceTypeId = parseInt(req.params.serviceTypeId, 10);
      const query = req.query as unknown as QueryParams;
      const employees = await EmployeeService.getEmployeesByServiceTypeId(serviceTypeId, query);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employees" });
    }
  }

  async getEmployeeById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = await EmployeeService.getEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employee" });
    }
  }

  async getEmployeeByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const employee = await EmployeeService.getEmployeeByEmail(email);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employee" });
    }
  }

  async getEmployeeByPhone(req: Request, res: Response) {
    try {
      const { phone } = req.params;
      const employee = await EmployeeService.getEmployeeByPhone(phone);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employee" });
    }
  }

  async getEmployeeByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const employees = await EmployeeService.getEmployeeByName(name);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch employees" });
    }
  }
}

export default new EmployeeController();
