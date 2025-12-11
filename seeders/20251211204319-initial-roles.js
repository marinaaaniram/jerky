'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Roles', [
      { name: 'Руководитель', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Менеджер по продажам', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Кладовщик', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Курьер', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Наблюдатель', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
