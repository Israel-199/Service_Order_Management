import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define attributes interface
interface NotificationAttributes {
  notification_id: number;
  service_order_id?: number | null;
  type: 'new_order' | 'completed' | 'assigned' | 'overdue';
  message: string;
  read?: boolean;
  created_at?: Date;
}

// 2. Define creation attributes (optional fields on create)
interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'notification_id' | 'service_order_id' | 'read' | 'created_at'> {}

// 3. Define model class
export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public notification_id!: number;
  public service_order_id?: number | null;
  public type!: 'new_order' | 'completed' | 'assigned' | 'overdue';
  public message!: string;
  public read?: boolean;
  public created_at?: Date;
}

// 4. Init function to initialize the model
export function initNotification(sequelize: Sequelize): typeof Notification {
  Notification.init(
    {
      notification_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('new_order', 'completed', 'assigned', 'overdue'),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: false,
    }
  );

  return Notification;
}

export type { NotificationAttributes, NotificationCreationAttributes };
export default initNotification;