import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Optional } from 'sequelize';
export interface NotificationAttributes {
  notification_id: number;
  service_order_id?: number | null;
  type: 'new_order' | 'completed' | 'assigned' | 'overdue';
  message: string;
  read?: boolean;
  created_at?: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'notification_id' | 'service_order_id' | 'read' | 'created_at'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public notification_id!: number;
  public service_order_id?: number | null;
  public type!: 'new_order' | 'completed' | 'assigned' | 'overdue';
  public message!: string;
  public read?: boolean;
  public created_at?: Date;
}

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
      underscored: true,
    }
  );

  return Notification;
}
