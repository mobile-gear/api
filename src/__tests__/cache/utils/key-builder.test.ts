import keyBuilder from "../../../cache/utils/key-builder";

describe("Key Builder", () => {
  describe("entity", () => {
    it("should build entity key", () => {
      const key = keyBuilder.entity("product", 1);
      expect(key).toBe("test:product:id:1:v1");
    });

    it("should build entity key with string id", () => {
      const key = keyBuilder.entity("user", "abc123");
      expect(key).toBe("test:user:id:abc123:v1");
    });

    it("should build entity key with custom version", () => {
      const key = keyBuilder.entity("product", 1, "v2");
      expect(key).toBe("test:product:id:1:v2");
    });
  });

  describe("collection", () => {
    it("should build collection key with query", () => {
      const key = keyBuilder.collection("products", { page: 1, limit: 10 });
      expect(key).toContain("test:products:list:");
      expect(key).toContain("limit:10");
      expect(key).toContain("page:1");
    });

    it("should build collection key without query", () => {
      const key = keyBuilder.collection("orders", {});
      expect(key).toBe("test:orders:list::v1");
    });

    it("should build collection key filtering undefined values", () => {
      const key = keyBuilder.collection("products", { page: 1, limit: undefined, category: "electronics" });
      expect(key).toContain("page:1");
      expect(key).toContain("category:electronics");
      expect(key).not.toContain("limit");
    });

    it("should build collection key with custom version", () => {
      const key = keyBuilder.collection("products", { page: 1 }, "v2");
      expect(key).toContain("v2");
    });
  });

  describe("search", () => {
    it("should build search key", () => {
      const key = keyBuilder.search("products", "laptop", 1);
      expect(key).toBe("test:products:search:laptop:page:1:v1");
    });

    it("should normalize query to lowercase", () => {
      const key = keyBuilder.search("products", "LAPTOP", 1);
      expect(key).toContain("laptop");
    });

    it("should trim query", () => {
      const key = keyBuilder.search("products", "  laptop  ", 1);
      expect(key).toContain("laptop");
      expect(key).not.toContain("  ");
    });

    it("should build search key with custom version", () => {
      const key = keyBuilder.search("products", "laptop", 1, "v2");
      expect(key).toContain("v2");
    });
  });

  describe("bulk", () => {
    it("should build bulk key", () => {
      const key = keyBuilder.bulk("products", [1, 2, 3]);
      expect(key).toContain("test:products:bulk:");
      expect(key).toMatch(/:[a-f0-9]{32}:v1$/);
    });

    it("should sort ids before hashing", () => {
      const key1 = keyBuilder.bulk("products", [3, 1, 2]);
      const key2 = keyBuilder.bulk("products", [1, 2, 3]);
      expect(key1).toBe(key2);
    });

    it("should build bulk key with custom version", () => {
      const key = keyBuilder.bulk("products", [1, 2, 3], "v2");
      expect(key).toContain("v2");
    });
  });

  describe("entityPattern", () => {
    it("should build entity pattern", () => {
      const pattern = keyBuilder.entityPattern("product", 1);
      expect(pattern).toBe("test:product:id:1:*");
    });

    it("should build entity pattern with string id", () => {
      const pattern = keyBuilder.entityPattern("user", "abc123");
      expect(pattern).toBe("test:user:id:abc123:*");
    });
  });

  describe("typePattern", () => {
    it("should build pattern for entity type", () => {
      const pattern = keyBuilder.typePattern("product");
      expect(pattern).toBe("test:product:*");
    });

    it("should build pattern for collection type", () => {
      const pattern = keyBuilder.typePattern("products");
      expect(pattern).toBe("test:products:*");
    });
  });
});
