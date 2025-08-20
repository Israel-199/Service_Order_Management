import { DataTypes, Model, Sequelize } from 'sequelize';

interface EmployeeServiceTypeAttributes {
  employee_id: number;
  service_type_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface EmployeeServiceTypeCreationAttributes extends Partial<Pick<EmployeeServiceTypeAttributes, 'created_at' | 'updated_at'>> {}

export class EmployeeServiceType extends Model<EmployeeServiceTypeAttributes, EmployeeServiceTypeCreationAttributes>
  implements EmployeeServiceTypeAttributes {
  public employee_id!: number;
  public service_type_id!: number;
  public created_at?: Date;
  public updated_at?: Date;
}

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
      // Let Sequelize manage timestamps (created_at, updated_at) via timestamps: true + underscored: true
    },
    {
      sequelize,
      tableName: 'employee_service_types',
      timestamps: true,
      underscored: true,
    }
  );

  return EmployeeServiceType;
}
