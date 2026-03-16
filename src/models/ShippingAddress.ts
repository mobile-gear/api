import {
  DataTypes,
} from "sequelize";
import sequelize from "../db/database";
import BaseModel from "./BaseModel";

class ShippingAddress extends BaseModel<ShippingAddress> {
  public street!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
}

ShippingAddress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "zip_code",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ShippingAddress",
    tableName: "shipping_addresses",
    timestamps: true,
    underscored: true,
  },
);

export default ShippingAddress;
