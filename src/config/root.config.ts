import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import validationEnv from "./joi.config";
import env from "@utils/constant/env";
import { AuthModule } from "@modules/auth/auth.module";
import { MerchantModule } from "@modules/merchant/merchant.modules";
import { EmailModule } from "@modules/email/email.module";
import { TransactionLogModule } from "@modules/transaction-log/transaction-log.module";
import { EventLogsModule } from "@modules/event-logs/event-logs.module";
import { BullModule } from "@nestjs/bull";
import { WalletsModule } from "@modules/wallets/wallets.module";
import * as redisStore from "cache-manager-redis-store";
import { ContractModule } from "@modules/contract/contract.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { MerchantSubscriberModule } from "@modules/merchant-subscriber/merchant-subscriber.module";
import { CacheModule } from "@nestjs/cache-manager";
import { TokenPriceModule } from "@modules/token-price/token-price.module";
import { TonModule } from "@modules/ton/ton.module";

export const RootModule = [
  ConfigModule.forRoot({
    validationSchema: Joi.object({
      validationEnv,
    }),
    isGlobal: true,
  }),
  JwtModule.register({
    secretOrPrivateKey: `${env.JWT_SECRET_KEY || "nami"}`,
    signOptions: {
      expiresIn: 1000 * 60 * 60 * 6, // 6 hour,
    },
  }),
  ScheduleModule.forRoot(),
  MongooseModule.forRoot(env.MONGO_URL),
  BullModule.forRoot({
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
    },
  }),
  CacheModule.register({
    store: redisStore,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    prefix: "vnst_be:",
    ttl: 60 * 10,
    isGlobal: true,
  }),
  TonModule,
  AuthModule,
  MerchantModule,
  TransactionLogModule,
  EventLogsModule,
  WalletsModule,
  ContractModule,
  NotificationModule,
  MerchantSubscriberModule,
  ContractModule,
  EmailModule,
  TokenPriceModule,
];
