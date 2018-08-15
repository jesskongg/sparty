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
  }, {});
  Room.associate = function(models) {
    // associations can be defined here
    Room.belongsTo(models.User, { foreignKey: 'owner', targetKey: 'spotify_id' });

  };
  return Room;
};
