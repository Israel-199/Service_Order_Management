import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define the model attributes interface
interface ServiceTypeAttributes {
  service_type_id: number;
  name: string;
  slug?: string;
  description?: string;
  created_at?: Date;
}

// 2. Define creation attributes for optional fields on create
interface ServiceTypeCreationAttributes
  extends Optional<ServiceTypeAttributes, 'service_type_id' | 'slug' | 'description' | 'created_at'> {}

// 3. Define the class model
class ServiceType extends Model<ServiceTypeAttributes, ServiceTypeCreationAttributes>
  implements ServiceTypeAttributes {
  public service_type_id!: number;
  public name!: string;
  public slug?: string;
  public description?: string;
  public created_at?: Date;

  // You can add instance or static methods here
}

// 4. Init function to call from your model index
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
    }
  );

  return ServiceType;
}

// Export CommonJS style
//module.exports = initServiceType;

// Export ES6 style
//export default initServiceType;
export { ServiceType, initServiceType };

// If you are using TypeScript, you can also export the types
//export type { ServiceTypeAttributes, ServiceTypeCreationAttributes };
