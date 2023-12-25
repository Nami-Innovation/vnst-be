import * as redisStore from "cache-manager-redis-store";
import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import env from "@utils/constant/env";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    CacheModule.register({
      useFactory: async () => ({
        store: redisStore,
        host: env.REDIS_HORT,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
