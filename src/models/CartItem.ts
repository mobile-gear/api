import {
  DataTypes,
} from "sequelize";
import db from "../db/database";
import BaseModel from "./BaseModel";

class CartItem extends BaseModel<CartItem> {
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: true,
    underscored: true,
  },
);

export default CartItem;
