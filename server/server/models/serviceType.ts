import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Optional } from 'sequelize';
interface ServiceTypeAttributes {
  service_type_id: number;
  name: string;
  slug?: string;
  description?: string;
  created_at?: Date;
}

interface ServiceTypeCreationAttributes
  extends Optional<ServiceTypeAttributes, 'service_type_id' | 'slug' | 'description' | 'created_at'> {}

class ServiceType extends Model<ServiceTypeAttributes, ServiceTypeCreationAttributes>
  implements ServiceTypeAttributes {
  public service_type_id!: number;
  public name!: string;
  public slug?: string;
  public description?: string;
  public created_at?: Date;
}

function initServiceType(sequelize: Sequelize): typeof ServiceType {
  ServiceType.init(
    {
      service_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'service_types',
      timestamps: false,
      underscored: true,
    }
  );

  return ServiceType;
}

export { ServiceType, initServiceType };
export type { ServiceTypeAttributes, ServiceTypeCreationAttributes };
