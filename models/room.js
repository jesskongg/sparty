'use strict';
module.exports = (sequelize, DataTypes) => {
  var Room = sequelize.define('Room', {
    avatar: {
      DataTypes.STRING
    },
    name: {
      DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      DataTypes.STRING,
      allowNull: false
    },
    key: {
      DataTypes: STRING,
    },
    public: {
      DataTypes: BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {});
  Room.associate = function(models) {
    // associations can be defined here
    Room.belongsto(User, { foreignKey: 'owner', targetKey: 'spotify_id' });
  };
  return Room;
};
