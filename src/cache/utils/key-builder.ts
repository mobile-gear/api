import crypto from "crypto";
import { CacheableValue } from "../interfaces/cache-types";

export class CacheKeyBuilder {
  private env: string;

  constructor() {
    this.env = process.env.NODE_ENV || "development";
  }

  entity(type: string, id: number | string, version = "v1"): string {
    return `${this.env}:${type}:id:${id}:${version}`;
  }

  collection<T extends Record<string, CacheableValue | undefined>>(
    type: string,
    filters: T,
    version = "v1",
  ): string {
    const sortedFilters = Object.keys(filters)
      .filter((key) => filters[key] !== undefined)
      .sort()
      .map((key) => `${key}:${filters[key]}`)
      .join(":");

    return `${this.env}:${type}:list:${sortedFilters}:${version}`;
  }

  search(type: string, query: string, page: number, version = "v1"): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `${this.env}:${type}:search:${normalizedQuery}:page:${page}:${version}`;
  }

  bulk(type: string, ids: number[], version = "v1"): string {
    const sortedIds = ids.sort((a, b) => a - b).join(",");
    const hash = crypto.createHash("md5").update(sortedIds).digest("hex");
    return `${this.env}:${type}:bulk:${hash}:${version}`;
  }

  entityPattern(type: string, id: number | string): string {
    return `${this.env}:${type}:id:${id}:*`;
  }

  typePattern(type: string): string {
    return `${this.env}:${type}:*`;
  }
}

export default new CacheKeyBuilder();
