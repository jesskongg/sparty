'use strict';
module.exports = (sequelize, DataTypes) => {
  var Song = sequelize.define('Song', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    album: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uri: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
  }, {});
  Song.associate = function(models) {
    // associations can be defined here
    // This will add methods getSongs, setSongs, addSong,addSongs to Room, and getRooms, setRooms, addRoom, and addRooms to Song
    Song.belongsToMany(models.Room, { through: 'RoomSong', foreignKey: 'songId'});
  };
  return Song;
};
