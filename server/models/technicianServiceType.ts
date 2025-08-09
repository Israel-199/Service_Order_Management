import { DataTypes, Model, Sequelize } from 'sequelize';

// 1. Define model attributes interface
interface TechnicianServiceTypeAttributes {
  lead_employees_id: number;
  service_type_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Creation attributes (all required except timestamps)
interface TechnicianServiceTypeCreationAttributes extends Partial<Pick<TechnicianServiceTypeAttributes, 'createdAt' | 'updatedAt'>> {}

// 3. Define the model class
export class TechnicianServiceType extends Model<TechnicianServiceTypeAttributes, TechnicianServiceTypeCreationAttributes>
  implements TechnicianServiceTypeAttributes {
  public lead_employees_id!: number;
  public service_type_id!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
}

// 4. Init function for model
export function initTechnicianServiceType(sequelize: Sequelize): typeof TechnicianServiceType {
  TechnicianServiceType.init(
    {
      lead_employees_id: {
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
      tableName: 'technician_service_types',
      timestamps: true,
    }
  );

  return TechnicianServiceType;
}
