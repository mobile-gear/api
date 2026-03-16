import { Product } from "../../models";

// Tipos base para valores cacheables
export type CacheableValue = string | number | boolean | null | undefined;
export type CacheableRecord = Record<string, CacheableValue>;

// Resultado paginado genérico (usado por repository)
export interface PaginatedResult<T> {
  pagination: {
    count: number;
    limit: number;
    page: number;
  };
  products: T[];
}

// Tipo específico para productos paginados
export type ProductListResult = PaginatedResult<Product>;
