import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../sequelize/index.js";

export const UserModel = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING(100),
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

UserModel.prototype.validatePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
