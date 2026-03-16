import { Product } from "../../models";

export type CacheableValue = string | number | boolean | null | undefined;
export type CacheableRecord = Record<string, CacheableValue>;

export interface PaginatedResult<T> {
  pagination: {
    count: number;
    limit: number;
    page: number;
  };
  products: T[];
}

export type ProductListResult = PaginatedResult<Product>;
