import CacheService from "../cache.service";
import keyBuilder from "../utils/key-builder";
import { User } from "../../models";

const TTL = {
  SINGLE: 1800,
};

class UserCacheStrategy {
  private singleCache = new CacheService<User>(TTL.SINGLE);

  async getById(id: number): Promise<User | null> {
    const key = keyBuilder.entity("user", id);
    return this.singleCache.get(key);
  }

  async setById(id: number, user: User): Promise<void> {
    const key = keyBuilder.entity("user", id);
    await this.singleCache.set(key, user, TTL.SINGLE);
  }

  async invalidateById(id: number): Promise<void> {
    await this.singleCache.delete(keyBuilder.entity("user", id));
  }
}

export default new UserCacheStrategy();
