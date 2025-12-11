'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliverySurvey extends Model {
    static associate(models) {
      // define association here
      DeliverySurvey.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }
  DeliverySurvey.init({
    order_id: {
      type: DataTypes.INTEGER,
      unique: true
    },
    photo_url: DataTypes.STRING,
    stock_check_notes: DataTypes.STRING,
    layout_notes: DataTypes.STRING,
    other_notes: DataTypes.STRING,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DeliverySurvey',
  });
  return DeliverySurvey;
};