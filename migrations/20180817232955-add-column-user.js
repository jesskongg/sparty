'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return [
      queryInterface.addColumn('Users', 'access_token', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Users', 'refresh_token', {
        type: Sequelize.STRING,
      })
    ];
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return [
      queryInterface.removeColumn('Users', 'access_token'),
      queryInterface.removeColumn('Users', 'refresh_token')
    ];
  }
};
