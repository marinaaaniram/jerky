'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockMovement extends Model {
    static associate(models) {
      // define association here
      StockMovement.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  StockMovement.init({
    product_id: DataTypes.INTEGER,
    quantity_change: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    movement_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'StockMovement',
  });
  return StockMovement;
};