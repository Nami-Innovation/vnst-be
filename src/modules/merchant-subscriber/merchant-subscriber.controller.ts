import { Controller, Post, Body, Logger } from "@nestjs/common";
import { MerchantSubscriberService } from "./merchant-subscriber.service";
import { ApiTags } from "@nestjs/swagger";
import { MerchantSubscriberDto } from "./dto/merchant-subscriber.dto";
import {
  ROUTER_MERCHANT_SUBSCRIBER,
  ROUTER_SUBSCRIBER,
} from "@utils/router/merchant-subscriber.router";

@ApiTags("Merchant Subscriber")
@Controller(ROUTER_MERCHANT_SUBSCRIBER)
export class MerchantSubscriberController {
  private readonly logger = new Logger(MerchantSubscriberController.name);
  constructor(
    private readonly merchantSubscriberService: MerchantSubscriberService,
  ) {}

  @Post(ROUTER_SUBSCRIBER)
  async register(@Body() payload: MerchantSubscriberDto) {
    this.logger.log("Subscriber Merchant");
    return await this.merchantSubscriberService.saveMerchantSubscriber(payload);
  }
}
