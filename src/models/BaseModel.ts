import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { DateColumns } from "../types/common";

export default abstract class BaseModel<
  TModel extends Model & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
  },
> extends Model<
  InferAttributes<TModel, { omit: DateColumns }>,
  InferCreationAttributes<TModel, { omit: "id" | DateColumns }>
> {
  public id!: CreationOptional<number>;
  public readonly createdAt!: CreationOptional<Date>;
  public readonly updatedAt!: CreationOptional<Date>;
}
