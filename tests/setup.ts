jest.mock("@/cache/redis.client", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn().mockReturnValue(null),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isEnabled: jest.fn().mockReturnValue(false),
  },
}));

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: "pi_test" }),
      retrieve: jest.fn().mockResolvedValue({ id: "pi_test" }),
    },
  }));
});
