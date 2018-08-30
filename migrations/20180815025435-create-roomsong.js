'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RoomSongs', {
      // id: {
      //   allowNull: false,
      //   autoIncrement: true,
      //   primaryKey: true,
      //   type: Sequelize.INTEGER
      // },
      vote: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      songId: {
        type: Sequelize.STRING,
        references: {
          model: 'Songs',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      roomId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Rooms',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      return queryInterface.addConstraint('RoomSongs', ['roomId', 'songId'], {
        type: 'primary key',
        name: 'roomsongs_pkey'
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('RoomSongs');
  }
};
