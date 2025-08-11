import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define attributes interface
interface ServiceOrderStatusHistoryAttributes {
  history_id: number;
  order_id: number;
  old_status?: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed' | null;
  new_status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  changed_at?: Date;
  changed_by?: number | null;
  comment?: string;
}

// 2. Define creation attributes
interface ServiceOrderStatusHistoryCreationAttributes
  extends Optional<
    ServiceOrderStatusHistoryAttributes,
    'history_id' | 'old_status' | 'changed_at' | 'changed_by' | 'comment'
  > {}

// 3. Define model class
class ServiceOrderStatusHistory
  extends Model<ServiceOrderStatusHistoryAttributes, ServiceOrderStatusHistoryCreationAttributes>
  implements ServiceOrderStatusHistoryAttributes {
  public history_id!: number;
  public order_id!: number;
  public old_status?: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed' | null;
  public new_status!: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  public changed_at?: Date;
  public changed_by?: number | null;
  public comment?: string;
}

// 4. Init function
function initServiceOrderStatusHistory(sequelize: Sequelize): typeof ServiceOrderStatusHistory {
  ServiceOrderStatusHistory.init(
    {
      history_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      old_status: {
        type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
        allowNull: true,
      },
      new_status: {
        type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
        allowNull: false,
      },
      changed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      changed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'service_order_status_history',
      timestamps: false,
    }
  );

  return ServiceOrderStatusHistory;
}

//module.exports = initServiceOrderStatusHistory;
export {ServiceOrderStatusHistory, initServiceOrderStatusHistory};
export type {
  ServiceOrderStatusHistoryAttributes,
  ServiceOrderStatusHistoryCreationAttributes,
};