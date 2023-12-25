import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  TransactionLog,
  TransactionLogSchema,
} from "src/schema/transaction-log.schema";
import { TransactionLogService } from "./transaction-log.service";
import { TransactionLogController } from "./transaction-log.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionLog.name, schema: TransactionLogSchema },
    ]),
    HttpModule,
  ],
  controllers: [TransactionLogController],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
})
export class TransactionLogModule {}
