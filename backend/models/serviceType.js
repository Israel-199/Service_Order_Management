// models/serviceType.js
module.exports = (sequelize, DataTypes) => {
  const ServiceType = sequelize.define('ServiceType', {
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
    },
    description: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'service_types',
    timestamps: false,
  });

  return ServiceType;
};
