import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Optional } from 'sequelize';
// 1. Define attribute interface
interface ServiceOrderItemAttributes {
  item_id: number;
  order_id: number;
  service_type_id: number;
  unit_price: number;
  quantity: number;
  total_price: number;
}

// 2. Define creation attributes (optional fields on creation)
interface ServiceOrderItemCreationAttributes extends Optional<ServiceOrderItemAttributes, 'item_id'> {}

// 3. Define model class
class ServiceOrderItem extends Model<ServiceOrderItemAttributes, ServiceOrderItemCreationAttributes>
  implements ServiceOrderItemAttributes {
  public item_id!: number;
  public order_id!: number;
  public service_type_id!: number;
  public unit_price!: number;
  public quantity!: number;
  public total_price!: number;
}

// 4. Init function to initialize model
function initServiceOrderItem(sequelize: Sequelize): typeof ServiceOrderItem {
  ServiceOrderItem.init(
    {
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'service_orders',
      timestamps: false,   // we manage created_at/updated_at manually
      underscored: true,   // map camelCase <-> snake_case columns
    }
  );

  return ServiceOrderItem;
}

//module.exports = initServiceOrderItem;
export { ServiceOrderItem, initServiceOrderItem };

// Export the model for use in other parts of the application
export type { ServiceOrderItemAttributes, ServiceOrderItemCreationAttributes };