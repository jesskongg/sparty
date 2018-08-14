'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    spotify_id: DataTypes.STRING,
    primaryKey: true,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
