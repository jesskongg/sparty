'use strict';
module.exports = (sequelize, DataTypes) => {
  var room - song = sequelize.define('room-song', {
    vote: {
      type: DataTypes.NUMBER,
      defaultValue: 0
    },
    roomId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Room',
            key: 'id',
            allowNull: false
        }
    },
    songId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Song',
            key: 'id',
            allowNull: false
        }
    },
  }, {});
  room - song.associate = function(models) {
    // associations can be defined here
  };
  return room - song;
};
