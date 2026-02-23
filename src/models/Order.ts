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
      field: "user_id",
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
      field: "payment_intent_id",
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "shipping_address_id",
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
    underscored: true,
  },
);

export default Order;
