import { Model, DataTypes } from "sequelize";
import db from "../db/database";

class Order extends Model {
  public id!: number;
  public userId!: number;
  public status!: string;
  public total!: number;
  public paymentIntentId!: string;
  public shippingAddress!: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: "shipping_address",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize: db,
    tableName: "orders",
    timestamps: true,
  },
);

export default Order;
