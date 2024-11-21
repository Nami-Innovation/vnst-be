import { ContractService } from "@modules/contract/contract.service";
import { TonService } from "@modules/ton/ton.service";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { NETWORK } from "@utils/constant/chains";
import { Token } from "@utils/constant/token";
import dayjs from "dayjs";
import { Model } from "mongoose";
import { TokenPrice, TokenPriceDocument } from "src/schema/token-price.schema";

@Injectable()
export class TokenPriceSchedule {
  private readonly logger = new Logger(TokenPriceSchedule.name);
  constructor(
    @InjectModel(TokenPrice.name)
    private readonly tokenPriceModel: Model<TokenPriceDocument>,
    private readonly contractService: ContractService,
    private readonly tonService: TonService,
  ) {}

  @Cron("0/5 * * * *") //every 5 minutes
  async cronGetPrice() {
    try {
      const marketPrice = await this.contractService.getMarketPrice();
      const time = dayjs().startOf("minute").toDate();
      await this.tokenPriceModel.create({
        time,
        price: marketPrice,
        token: Token.USDT,
        network: NETWORK.BNB,
      });
    } catch (error) {
      this.logger.error("Failed to get market price on BNB", error);
    }
  }

  @Cron("0/5 * * * *") //every 5 minutes
  async cronGetPriceTon() {
    try {
      const marketPrice = await this.tonService.getMarketPrice();
      const time = dayjs().startOf("minute").toDate();
      await this.tokenPriceModel.create({
        time,
        price: marketPrice,
        token: Token.USDT,
        network: NETWORK.TON,
      });
    } catch (error) {
      this.logger.error("Failed to get market price on TON", error);
    }
  }
}
