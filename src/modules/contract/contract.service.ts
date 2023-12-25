import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VNST_ABI } from "@utils/constant/web3";
import { Model } from "mongoose";
import Web3 from "web3";
import {
  ContractSetting,
  ContractSettingDocument,
} from "./schemas/contract-setting.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  private readonly vnstAddress = this.config
    .get("ADDRESS_SMART_CONTRACT")
    .toLowerCase();
  private readonly web3 = new Web3(
    new Web3.providers.HttpProvider(this.config.get("BSC_RPC_HTTP")),
  );

  private readonly vnstContract = new this.web3.eth.Contract(
    VNST_ABI,
    this.vnstAddress,
  );

  constructor(
    private config: ConfigService,
    @InjectModel(ContractSetting.name)
    private readonly settingModel: Model<ContractSettingDocument>,
  ) {}

  getContract() {
    return this.vnstContract;
  }

  getAddress() {
    return this.vnstAddress;
  }

  getBlockNumber() {
    return this.web3.eth.getBlockNumber();
  }

  async getOtcDeltaSetting() {
    const setting = await this.settingModel.findOne({ key: "otcDelta" });
    return setting?.value || 25;
  }

  async getBalanceOf(address: string) {
    const balance: bigint = await this.vnstContract.methods
      // @ts-ignore
      .balanceOf(address)
      .call();

    return Number(Web3.utils.fromWei(balance, "ether"));
  }

  async getMarketPrice() {
    const marketPrice: bigint = await this.vnstContract.methods
      .market_price()
      .call();
    return (Web3.utils.toNumber(marketPrice) as number) / 10 ** 6;
  }

  async getOperationPool() {
    const balance: bigint = await this.vnstContract.methods
      // @ts-ignore
      .operation_pool()
      .call();
    return Number(Web3.utils.fromWei(balance, "ether"));
  }
}
