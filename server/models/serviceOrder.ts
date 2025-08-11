import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define attributes interface
interface ServiceOrderAttributes {
  order_id: number;
  customer_id: number;
  service_type_id: number;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  employee_id?: number;
  assigned_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  closed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  due_date?: Date;
}

// 2. Define creation attributes
interface ServiceOrderCreationAttributes
  extends Optional<
    ServiceOrderAttributes,
    | 'order_id'
    | 'description'
    | 'status'
    | 'employee_id'
    | 'assigned_at'
    | 'started_at'
    | 'completed_at'
    | 'closed_at'
    | 'created_at'
    | 'updated_at'
    | 'due_date'
  > {}

// 3. Define the model class, adding association properties
class ServiceOrder
  extends Model<ServiceOrderAttributes, ServiceOrderCreationAttributes>
  implements ServiceOrderAttributes
{
  public order_id!: number;
  public customer_id!: number;
  public service_type_id!: number;
  public description?: string;
  public priority!: 'low' | 'medium' | 'high';
  public status?: 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  public employee_id?: number;
  public assigned_at?: Date;
  public started_at?: Date;
  public completed_at?: Date;
  public closed_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;
  public due_date?: Date;

  // Association properties (added to resolve TS errors)
  public ServiceType?: { name?: string } | null;
  public Customer?: { name?: string; email?: string } | null;
  public Attachments?: Array<{ file_path: string; file_type: string }> | null;
  public ServiceOrderAssignments?: Array<{ 
    Employee?: { name?: string; email?: string } 
  }> | null;
}

// 4. Export an init function that takes sequelize and DataTypes
function initServiceOrder(sequelize: Sequelize): typeof ServiceOrder {
  ServiceOrder.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
        defaultValue: 'new',
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      closed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'service_orders',
      timestamps: false,
    }
  );

  return ServiceOrder;
}

export { ServiceOrder, initServiceOrder };
export type { ServiceOrderAttributes, ServiceOrderCreationAttributes };