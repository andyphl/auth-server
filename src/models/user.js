"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
      };
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { message: "Username cannot be null" },
          notEmpty: { message: "Username cannot be empty" },
          len: {
            message: "User can only be 2 to 30 characters",
            args: [2, 30],
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { message: "Email cannot be null" },
          notEmpty: { message: "Email cannot be empty" },
          isEmail: { message: "These must be an email" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { message: "Paswword cannot be null" },
          notEmpty: { message: "Paswword cannot be empty" },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { message: "Role cannot be null" },
          notEmpty: { message: "Role cannot be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
