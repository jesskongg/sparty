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
    Song.belongsToMany(models.Room, { through: 'room-song', foreignKey: 'songId'});
  };
  return Song;
};
