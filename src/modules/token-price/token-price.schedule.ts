import { ContractService } from "@modules/contract/contract.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Token } from "@utils/constant/token";
import dayjs from "dayjs";
import { Model } from "mongoose";
import { TokenPrice, TokenPriceDocument } from "src/schema/token-price.schema";

@Injectable()
export class TokenPriceSchedule {
  constructor(
    @InjectModel(TokenPrice.name)
    private readonly tokenPriceModel: Model<TokenPriceDocument>,
    private readonly contractService: ContractService,
  ) {}

  @Cron("0/5 * * * *") //every 5 minutes
  async cronGetPrice() {
    const marketPrice = await this.contractService.getMarketPrice();
    const time = dayjs().startOf("minute").toDate();
    await this.tokenPriceModel.create({
      time,
      price: marketPrice,
      token: Token.USDT,
    });
  }
}
