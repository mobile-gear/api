import { Model } from "sequelize-typescript";

export default class BaseModel<T extends { id?: number }> extends Model<T> {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
