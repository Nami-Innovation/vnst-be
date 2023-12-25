import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  get = async <T>(key: string): Promise<Awaited<T>> => {
    const value = await this.cacheManager.get<T>(key);
    return value;
  };

  set = async <T>(key: any, value: unknown, ttl?: number) => {
    return await this.cacheManager.set(key, value, {ttl});
  };

  del = async (key: string) => {
    return await this.cacheManager.del(key);
  };
}
