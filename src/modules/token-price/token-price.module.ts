import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TokenPriceService } from "./token-price.service";
import { TokenPrice, TokenPriceSchema } from "src/schema/token-price.schema";
import { TokenPriceController } from "./token-price.controller";
import { ContractModule } from "@modules/contract/contract.module";
import { TokenPriceSchedule } from "./token-price.schedule";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenPrice.name, schema: TokenPriceSchema },
    ]),
    ContractModule,
  ],
  controllers: [TokenPriceController],
  providers: [TokenPriceService, TokenPriceSchedule],
  exports: [TokenPriceService],
})
export class TokenPriceModule {}
