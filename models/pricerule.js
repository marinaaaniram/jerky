'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PriceRule extends Model {
    static associate(models) {
      // define association here
      PriceRule.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      PriceRule.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  PriceRule.init({
    customer_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    special_price: DataTypes.REAL
  }, {
    sequelize,
    modelName: 'PriceRule',
    indexes: [{
      unique: true,
      fields: ['customer_id', 'product_id']
    }]
  });
  return PriceRule;
};