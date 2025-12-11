'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
      Product.hasMany(models.StockMovement, {
        foreignKey: 'product_id',
        as: 'stockMovements'
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
      });
      Product.hasMany(models.PriceRule, {
        foreignKey: 'product_id',
        as: 'priceRules'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.REAL,
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};