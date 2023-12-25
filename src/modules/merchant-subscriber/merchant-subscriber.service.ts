import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  MerchantSubscriber,
  MerchantSubscriberDocument,
} from "src/schema/merchant-subscriber.schema";
import { MerchantSubscriberDto } from "./dto/merchant-subscriber.dto";
import { EmailService } from "@modules/email/email.service";
import { EMAIL_DTO_SUBJECT_TEST } from "@modules/email/email.constants";

@Injectable()
export class MerchantSubscriberService {
  constructor(
    @InjectModel(MerchantSubscriber.name)
    private merchantSubscriberModel: Model<MerchantSubscriberDocument>,
    private emailService: EmailService,
  ) {}

  async saveMerchantSubscriber(
    payload: MerchantSubscriberDto,
  ): Promise<MerchantSubscriber> {
    const { name, email, telegramId } = payload;
    let subscriber: MerchantSubscriber;

    if (email) {
      const findByEmail = await this.merchantSubscriberModel
        .findOne({ email })
        .exec();

      if (findByEmail)
        throw new ConflictException("merchant_subscribe_already_exists");

      subscriber = await this.merchantSubscriberModel.create({ name, email });
    } else {
      const findByTelegramId = await this.merchantSubscriberModel
        .findOne({ telegramId })
        .exec();

      if (findByTelegramId)
        throw new ConflictException("merchant_subscribe_already_exists");

      subscriber = await this.merchantSubscriberModel.create({
        name,
        telegramId,
      });
    }
    // Comment vì chưa có template
    // if (email) {
    //   await this.emailService.sendEmail({
    //     recipient: email,
    //     subject: EMAIL_DTO_SUBJECT_TEST,
    //     text: name,
    //   });
    // }
    return subscriber;
  }
}
