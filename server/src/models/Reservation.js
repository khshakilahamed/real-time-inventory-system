import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../sequelize/index.js";
import { UserModel } from "./User.js";
import { DropModel } from "./Drop.js";

export const ReservationModel = sequelize.define(
  "Reservation",
  {
    id: {
      type: DataTypes.STRING(100),
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "user_id",
    },
    dropId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "drop_id",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
      validate: { isIn: [["pending", "completed", "expired"]] },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    tableName: "reservations",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

UserModel.hasMany(ReservationModel, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "reservations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ReservationModel.belongsTo(UserModel, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});

DropModel.hasMany(ReservationModel, {
  foreignKey: "dropId",
  sourceKey: "id",
  as: "reservations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ReservationModel.belongsTo(DropModel, {
  foreignKey: "dropId",
  targetKey: "id",
  as: "drop",
});
