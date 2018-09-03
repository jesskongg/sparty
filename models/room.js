'use strict';
module.exports = (sequelize, DataTypes) => {
  var Room = sequelize.define('Room', {
    avatar: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    expired: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
    }
  }, {});
  Room.associate = function(models) {
    // associations can be defined here
    Room.belongsTo(models.User, { foreignKey: 'owner', targetKey: 'spotify_id' });
    // This will add methods getSongs, setSongs, addSong,addSongs to Room, and getRooms, setRooms, addRoom, and addRooms to Song
    Room.belongsToMany(models.Song, { through: 'RoomSong', foreignKey: 'roomId'});
  };

  Room.prototype.getUrl = function() {
    return '/api/room/' + this.id;
  };

  return Room;
};
