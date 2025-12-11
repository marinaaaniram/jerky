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
    await queryInterface.bulkInsert('Customers', [
      { name: 'Точка А (Прямые)', address: 'ул. Первая, 1', phone: '111-111-1111', payment_type: 'прямые', debt: 0, is_archived: 0, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Точка Б (Реализация)', address: 'ул. Вторая, 2', phone: '222-222-2222', payment_type: 'реализация', debt: 150.50, is_archived: 0, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Точка В (Архив)', address: 'ул. Архивная, 3', phone: '333-333-3333', payment_type: 'прямые', debt: 0, is_archived: 1, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Customers', null, {});
  }
};
