'use strict';
module.exports = (sequelize, DataTypes) => {
  var RoomSong = sequelize.define('RoomSong', {
    vote: {
      type: DataTypes.INTEGER,
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
  RoomSong.associate = function(models) {
    // associations can be defined here
  };
  return RoomSong;
};
