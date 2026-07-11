import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../sequelize/index.js";

export const DropModel = sequelize.define(
  "Drop",
  {
    id: {
      type: DataTypes.STRING(100),
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "total_stock"
    },
    availableStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "available_stock"
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "starts_at"
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "image_url"
    },
  },
  {
    tableName: "drops",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
