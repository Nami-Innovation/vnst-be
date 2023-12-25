import { Module } from "@nestjs/common";
import { MerchantController } from "./merchant.controller";
import { MerchantService } from "./merchant.service";
import { Merchant, MerchantSchema } from "src/schema/merchant.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { ContributionHistoryService } from "./contribution-history.service";
import { ContributionHistoryController } from "./contribution-history.controller";
import {
  ContributionHistory,
  ContributionHistorySchema,
} from "src/schema/merchant-contribution-history.schema";
import {
  LiquiditySupport,
  LiquiditySupportSchema,
} from "src/schema/merchant-liquidity-support.schema";
import { LiquiditySupportService } from "./liquidity-support.service";
import { LiquiditySupportController } from "./liquidity-support.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
    ]),
    MongooseModule.forFeature([
      { name: ContributionHistory.name, schema: ContributionHistorySchema },
    ]),
    MongooseModule.forFeature([
      { name: LiquiditySupport.name, schema: LiquiditySupportSchema },
    ]),
    HttpModule,
  ],
  providers: [
    MerchantService,
    ContributionHistoryService,
    LiquiditySupportService,
  ],
  controllers: [
    MerchantController,
    ContributionHistoryController,
    LiquiditySupportController,
  ],
  exports: [MerchantService],
})
export class MerchantModule {}
