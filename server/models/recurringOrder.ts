import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define attributes interface
interface RecurringOrderAttributes {
  recurring_id: number;
  order_id: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  next_due_date?: Date;
  end_date: Date;
  created_at?: Date;
}

// 2. Define creation attributes (optional on creation)
interface RecurringOrderCreationAttributes
  extends Optional<RecurringOrderAttributes, 'recurring_id' | 'frequency' | 'next_due_date' | 'created_at'> {}

// 3. Define the model class
export class RecurringOrder extends Model<RecurringOrderAttributes, RecurringOrderCreationAttributes>
  implements RecurringOrderAttributes {
  public recurring_id!: number;
  public order_id!: number;
  public frequency?: 'daily' | 'weekly' | 'monthly';
  public next_due_date?: Date;
  public end_date!: Date;
  public created_at?: Date;
}

// 4. Init function for the model
export function initRecurringOrder(sequelize: Sequelize): typeof RecurringOrder {
  RecurringOrder.init(
    {
      recurring_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: true,
      },
      next_due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'recurring_orders',
      timestamps: false,
    }
  );

  return RecurringOrder;
}

export type { RecurringOrderAttributes, RecurringOrderCreationAttributes };
export default RecurringOrder;