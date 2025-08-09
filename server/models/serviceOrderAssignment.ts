import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define model attributes interface
interface ServiceOrderAssignmentAttributes {
  assignment_id: number;
  order_id: number;
  employees_id: number;
  role_in_order?: string;
  assigned_at?: Date;
  unassigned_at?: Date;
  notes?: string;
}

// 2. Define creation attributes (optional fields on creation)
interface ServiceOrderAssignmentCreationAttributes
  extends Optional<
    ServiceOrderAssignmentAttributes,
    'assignment_id' | 'role_in_order' | 'assigned_at' | 'unassigned_at' | 'notes'
  > {}

// 3. Define model class
class ServiceOrderAssignment
  extends Model<ServiceOrderAssignmentAttributes, ServiceOrderAssignmentCreationAttributes>
  implements ServiceOrderAssignmentAttributes {
  public assignment_id!: number;
  public order_id!: number;
  public employees_id!: number;
  public role_in_order?: string;
  public assigned_at?: Date;
  public unassigned_at?: Date;
  public notes?: string;
}

// 4. Init function to initialize model
function initServiceOrderAssignment(sequelize: Sequelize): typeof ServiceOrderAssignment {
  ServiceOrderAssignment.init(
    {
      assignment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employees_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role_in_order: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      unassigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'service_order_assignments',
      timestamps: false,
    }
  );

  return ServiceOrderAssignment;
}

//module.exports = initServiceOrderAssignment;
export { ServiceOrderAssignment, initServiceOrderAssignment };
export type { ServiceOrderAssignmentAttributes, ServiceOrderAssignmentCreationAttributes };
export default ServiceOrderAssignment; // Default export for ES6 modules
