'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    spotify_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Room, { foreignKey: 'owner', sourceKey: 'spotify_id'});
  };
  return User;
};
