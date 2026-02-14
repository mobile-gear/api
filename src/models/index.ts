import Order from "./Order";
import Product from "./Product";
import User from "./User";
import CartItem from "./CartItem";

User.hasMany(Order, {
  foreignKey: "userId",
});

Order.belongsTo(User, {
  foreignKey: "userId",
});

Product.hasMany(CartItem, {
  foreignKey: "productId",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
});

Order.hasMany(CartItem, {
  foreignKey: "orderId",
  as: "items",
});

CartItem.belongsTo(Order, {
  foreignKey: "orderId",
});

export { User, Product, Order, CartItem };
