import { Module } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { WalletsController } from "./wallets.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Wallet, WalletSchema } from "src/schema/wallet.schema";
import { BullModule } from "@nestjs/bull";
import { EmailModule } from "@modules/email/email.module";
import { ContractModule } from "@modules/contract/contract.module";
import { RedisCacheModule } from "@modules/cache/cache.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "eventLog",
    }),
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    EmailModule,
    ContractModule,
    RedisCacheModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
