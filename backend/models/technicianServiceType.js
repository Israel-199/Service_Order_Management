const { DataTypes } = require('sequelize');
const sequelize = require('../database');

module.exports = (sequelize, DataTypes) => {
    const TechnicianServiceType = sequelize.define('TechnicianServiceType', {
        lead_employees_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        service_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'technician_service_types',
        timestamps: true,
    });
    return TechnicianServiceType;
}
/////////////////
