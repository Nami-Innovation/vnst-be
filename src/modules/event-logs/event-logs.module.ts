import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { EventLog, EventLogSchema } from "src/schema/event-log.schema";
import { EventLogsService } from "./event-logs.service";
import { EventLogsController } from "./event-logs.controller";
import { WalletsModule } from "@modules/wallets/wallets.module";
import { BullModule } from "@nestjs/bull";
import { EventLogsConsumer } from "./event-logs.consumer";
import { ContractModule } from "@modules/contract/contract.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { EmailModule } from "@modules/email/email.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "eventLog",
    }),
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
    WalletsModule,
    ContractModule,
    NotificationModule,
    EmailModule,
  ],
  controllers: [EventLogsController],
  providers: [EventLogsService, EventLogsConsumer],
  exports: [EventLogsService],
})
export class EventLogsModule {}
