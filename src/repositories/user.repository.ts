import { CreationAttributes, WhereOptions } from "sequelize";
import UserQuery from "../interfaces/query/user";
import { User } from "../models";

const getOne = async (options: UserQuery) => {
  const { email } = options;
  const where: WhereOptions = {};
  if (email) where.email = email;

  const user = await User.findOne({
    where,
  });
  return user;
};

const getOneById = async (id: number) => {
  const user = await User.findByPk(id);
  return user;
};

const createOne = async (user: CreationAttributes<User>): Promise<User> => {
  const newUser = await User.create(user);
  return newUser;
};

export default { getOne, getOneById, createOne };
