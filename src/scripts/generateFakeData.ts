import bcrypt from "bcryptjs";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import sequelize from "../db/database";
import path from "path";
import fs from "fs";
import { CreationAttributes } from "sequelize";

type OrderCreationAttributes = CreationAttributes<Order>;
type OrderItemCreationAttributes = CreationAttributes<OrderItem>;

const generateUsers = async () => {
  const users = [
    {
      email: "admin@test.com",
      password: await bcrypt.hash("admin123", 10),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
    {
      email: "user@test.com",
      password: await bcrypt.hash("user123", 10),
      firstName: "Regular",
      lastName: "User",
      role: "user",
    },
  ];

  return users;
};

const loadProducts = () => {
  const productsPath = path.join(__dirname, "../db/products.json");
  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  return productsData.map((product: any) => ({
    name: product.name,
    description:
      product.description ||
      `${product.name} - A quality product from ${product.brand}`,
    price: product.price,
    category: product.category,
    stock: product.stock,
    img: product.img,
  }));
};

const generateOrders = (
  userIds: number[],
  productIds: number[],
): {
  orders: OrderCreationAttributes[];
  orderItems: OrderItemCreationAttributes[];
} => {
  const orders: OrderCreationAttributes[] = [];
  const orderItems: OrderItemCreationAttributes[] = [];

  userIds.forEach((userId) => {
    for (let i = 0; i < 3; i++) {
      const orderId = orders.length + 1;
      let total = 0;

      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numItems; i++) {
        const productId =
          productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 900) + 100;
        total += price * quantity;

        orderItems.push({
          orderId,
          productId,
          quantity,
          price,
        });
      }

      orders.push({
        userId,
        total,
        status: Math.random() > 0.5 ? "completed" : "pending",
        paymentIntentId: "1",
        shippingAddress: {
          street: "test street",
          city: "test city",
          state: "test state",
          zipCode: "test zip code",
          country: "test country",
        },
      });
    }
  });

  return { orders, orderItems };
};

export const generateFakeData = async () => {
  try {
    await sequelize.sync({ force: true });

    await sequelize.query(
      "TRUNCATE users, products, orders, order_items CASCADE",
    );

    const users = await generateUsers();
    const products = loadProducts();

    const createdUsers = await User.bulkCreate(users);
    const createdProducts = await Product.bulkCreate(products);

    const userIds = createdUsers.map((user) => user.id);
    const productIds = createdProducts.map((product) => product.id);

    const { orders, orderItems } = generateOrders(userIds, productIds);
    await Order.bulkCreate(orders);
    await OrderItem.bulkCreate(orderItems);

    console.log("Fake data generated successfully!");
  } catch (error) {
    console.error("Error generating fake data:", error);
    throw error;
  }
};

if (require.main === module) {
  generateFakeData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
