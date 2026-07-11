import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../sequelize/index.js";
import { UserModel } from "./User.js";
import { DropModel } from "./Drop.js";
import { ReservationModel } from "./Reservation.js";

export const PurchaseModel = sequelize.define(
  "Purchase",
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
    reservationId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "reservation_id",
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "amount_paid",
    },
  },
  {
    tableName: "purchases",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

UserModel.hasMany(PurchaseModel, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "purchases",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PurchaseModel.belongsTo(UserModel, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});

DropModel.hasMany(PurchaseModel, {
  foreignKey: "dropId",
  sourceKey: "id",
  as: "purchases",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PurchaseModel.belongsTo(DropModel, {
  foreignKey: "dropId",
  targetKey: "id",
  as: "drop",
});

ReservationModel.hasOne(PurchaseModel, {
  foreignKey: "reservationId",
  sourceKey: "id",
  as: "purchase",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PurchaseModel.belongsTo(ReservationModel, {
  foreignKey: "reservationId",
  targetKey: "id",
  as: "reservation",
});
