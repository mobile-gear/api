import {
  DataTypes,
} from "sequelize";
import db from "../db/database";
import BaseModel from "./BaseModel";

class Order extends BaseModel<Order> {
  public userId!: number;
  public status!: string;
  public total!: number;
  public paymentIntentId!: string;
  public shippingAddressId!: number;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "shipping_addresses",
        key: "id",
      },
    },
  },
  {
    sequelize: db,
    tableName: "orders",
    timestamps: true,
  },
);

export default Order;
