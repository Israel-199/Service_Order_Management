// models/employee.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface EmployeeAttributes {
  employee_id: number;
  name: string;
  email: string;
  phone?: string;
  specification: 'technician' | 'supervisor' | 'manager';
  created_at?: Date;
  status?: 'active' | 'inactive';
}

export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'employee_id' | 'created_at' | 'status'> {}

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  public employee_id!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public specification!: 'technician' | 'supervisor' | 'manager';
  public created_at?: Date;
  public status?: 'active' | 'inactive';
}

export function initEmployee(sequelize: Sequelize): typeof Employee {
  Employee.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
      },
      specification: {
        type: DataTypes.ENUM('technician', 'supervisor', 'manager'),
        allowNull: false,
        defaultValue: 'technician',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      tableName: 'employees',
      timestamps: false,
    }
  );

  return Employee;
}
