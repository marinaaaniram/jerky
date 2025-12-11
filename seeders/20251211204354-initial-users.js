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
    await queryInterface.bulkInsert('Users', [
      { firstName: 'Иван', lastName: 'Руководитель', email: 'ivan.director@example.com', role_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Петр', lastName: 'Менеджер', email: 'petr.manager@example.com', role_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Сергей', lastName: 'Кладовщик', email: 'sergey.storekeeper@example.com', role_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Алексей', lastName: 'Курьер', email: 'alexey.courier@example.com', role_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Мария', lastName: 'Наблюдатель', email: 'maria.observer@example.com', role_id: 5, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  }
};
