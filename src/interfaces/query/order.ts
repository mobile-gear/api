export default interface OrderQuery {
  id?: number;
  status?: string;
  minTotal?: string;
  maxTotal?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  userId?: number;
}