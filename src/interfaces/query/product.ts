import { SortOrder } from "../../types/common";

export default interface ProductQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  outOfStock?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
  searchTerm?: string;
}
