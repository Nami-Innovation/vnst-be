import { Module } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ContractSetting,
  ContractSettingSchema,
} from "./schemas/contract-setting.schema";
import { ContractController } from "./contract.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractSetting.name, schema: ContractSettingSchema },
    ]),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
