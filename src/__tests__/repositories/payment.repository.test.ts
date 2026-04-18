import paymentRepository from "../../repositories/payment.repository";

describe("Payment Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  describe("createPaymentIntent", () => {
    it("should create payment intent", async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const total = 100;

      const result = await paymentRepository.createPaymentIntent(items, total);
      expect(result).toHaveProperty("clientSecret");
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
    });

    it("should create payment intent with zero total", async () => {
      const items: Array<{ productId: number; quantity: number }> = [];
      const total = 0;

      const result = await paymentRepository.createPaymentIntent(items, total);
      expect(result).toHaveProperty("clientSecret");
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result.total).toBe(0);
    });

    it("should create payment intent with multiple items", async () => {
      const items = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ];
      const total = 300;

      const result = await paymentRepository.createPaymentIntent(items, total);
      expect(result).toHaveProperty("clientSecret");
      expect(result.items).toEqual(items);
      expect(result.total).toBe(300);
    });
  });
});
