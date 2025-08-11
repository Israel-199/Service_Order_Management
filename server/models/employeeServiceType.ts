import { DataTypes, Model, Sequelize } from 'sequelize';

// 1. Define model attributes interface
interface EmployeeServiceTypeAttributes {
  employee_id: number;
  service_type_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Creation attributes (all required except timestamps)
interface EmployeeServiceTypeCreationAttributes extends Partial<Pick<EmployeeServiceTypeAttributes, 'createdAt' | 'updatedAt'>> {}

// 3. Define the model class
export class EmployeeServiceType extends Model<EmployeeServiceTypeAttributes, EmployeeServiceTypeCreationAttributes>
  implements EmployeeServiceTypeAttributes {
  public employee_id!: number;
  public service_type_id!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
}

// 4. Init function for model
export function initEmployeeServiceType(sequelize: Sequelize): typeof EmployeeServiceType {
  EmployeeServiceType.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      service_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'employee_service_types',
      timestamps: true,
    }
  );

  return EmployeeServiceType;
}
