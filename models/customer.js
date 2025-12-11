'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      // define association here
      Customer.hasMany(models.Order, {
        foreignKey: 'customer_id',
        as: 'orders'
      });
      Customer.hasMany(models.Payment, {
        foreignKey: 'customer_id',
        as: 'payments'
      });
      Customer.hasMany(models.PriceRule, {
        foreignKey: 'customer_id',
        as: 'priceRules'
      });
    }
  }
  Customer.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    payment_type: {
      type: DataTypes.STRING,
      defaultValue: 'прямые'
    },
    debt: {
      type: DataTypes.REAL,
      defaultValue: 0
    },
    is_archived: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};