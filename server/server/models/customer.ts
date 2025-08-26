import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Optional } from 'sequelize';

export interface CustomerAttributes {
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tin_number?: string;
  created_at?: Date;
}

export interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'customer_id' | 'created_at'> {}

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public customer_id!: number;
  public name!: string;
  public email?: string;
  public phone?: string;
  public company?: string;
  public address?: string;
  public tin_number?: string;
  public created_at?: Date;
}

export function initCustomer(sequelize: Sequelize): typeof Customer {
  Customer.init(
    {
      customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      company: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.TEXT,
      },
      tin_number: {
        type: DataTypes.STRING(50),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customers',
      timestamps: false,
      underscored: true,
    }
  );

  return Customer;
}
