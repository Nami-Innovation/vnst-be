import * as redisStore from "cache-manager-redis-store";
import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import env from "@utils/constant/env";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    CacheModule.register({
      isGlobal:true,
      store: redisStore,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
