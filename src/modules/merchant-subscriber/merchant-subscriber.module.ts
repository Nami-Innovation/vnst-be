import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MerchantSubscriberService } from "./merchant-subscriber.service";
import { MerchantSubscriberController } from "./merchant-subscriber.controller";
import {
  MerchantSubscriber,
  MerchantSubscriberSchema,
} from "src/schema/merchant-subscriber.schema";
import { EmailService } from "@modules/email/email.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MerchantSubscriber.name, schema: MerchantSubscriberSchema },
    ]),
  ],
  providers: [MerchantSubscriberService, EmailService],
  controllers: [MerchantSubscriberController],
})
export class MerchantSubscriberModule {}
