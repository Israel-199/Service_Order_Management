// models/Employee.js
module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    employees_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING
    },
    specification: {
      type: DataTypes.ENUM('technician', 'supervisor', 'manager'),
      allowNull: false,
      defaultValue: 'technician'
    }
  }, {
    tableName: 'employees',
    timestamps: false
  });

  return Employee;
};
