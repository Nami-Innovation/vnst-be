import { Module } from "@nestjs/common";
import { TonService } from "./ton.service";
import { TonController } from "./ton.controller";
import { TonProofService } from "./ton-proof.service";
import { AccountSubscriptionService } from "./account-subscription.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  TonTransaction,
  TonTransactionSchema,
} from "src/schema/ton-transaction.schema";
import { TonSchedule } from "./ton.schedule";
import { WalletsModule } from "@modules/wallets/wallets.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { EmailModule } from "@modules/email/email.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TonTransaction.name, schema: TonTransactionSchema },
    ]),
    WalletsModule,
    NotificationModule,
    EmailModule
  ],
  controllers: [TonController],
  providers: [
    TonService,
    TonProofService,
    AccountSubscriptionService,
    TonSchedule,
  ],
  exports: [TonService, TonProofService],
})
export class TonModule {}
