module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFiles: ["<rootDir>/src/mocks/setup.ts", "dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/src/test-config.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.types.ts",
    "!src/scripts/**",
    "!src/db/database.ts",
    "!src/server.ts",
    "!src/cache/redis.client.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    "dotenv": {
      path: ".env.test",
    },
  },
};
