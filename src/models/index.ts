import Order from "./Order";
import Product from "./Product";
import User from "./User";
import CartItem from "./CartItem";
import ShippingAddress from "./ShippingAddress";

User.hasMany(Order, {
  foreignKey: "userId",
});

Order.belongsTo(User, {
  foreignKey: "userId",
});

ShippingAddress.hasMany(Order, {
  foreignKey: "shippingAddressId",
});

Order.belongsTo(ShippingAddress, {
  foreignKey: "shippingAddressId",
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

export { User, Product, Order, CartItem, ShippingAddress };
