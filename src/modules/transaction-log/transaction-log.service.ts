import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TransactionLog } from "src/schema/transaction-log.schema";
import {
  AXIOS_TIME_OUT,
  LINK_BSC,
  PARAM_GET_TRANSACTION,
} from "./transaction-log.constant";
import { HttpService } from "@nestjs/axios";
import { TransactionLogDto } from "./dto/transaction-log.dto";
import InputDataDecoder from "ethereum-input-data-decoder";
import { VNST_ABI } from "@utils/constant/web3";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TransactionLogService {
  constructor(
    @InjectModel(TransactionLog.name)
    private readonly modelTransactionLog: Model<TransactionLog>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async transactionLogJob() {
    try {
      const maxBlockNumber = await this.modelTransactionLog
        .findOne()
        .sort({ blockNumber: -1 })
        .select("blockNumber")
        .lean();

      const latestBlockNumber = maxBlockNumber
        ? maxBlockNumber.blockNumber + 1
        : 0;
      const urlBsc = this.config.get("URL_BSC");
      const response = await this.httpService.axiosRef.get(urlBsc, {
        params: { ...PARAM_GET_TRANSACTION, startblock: latestBlockNumber },
        timeout: AXIOS_TIME_OUT,
      });
      const { result } = response?.data;
      const decoder = new InputDataDecoder(VNST_ABI);
      for (const item of result) {
        const { method, inputs, names } = decoder.decodeData(item.input);
        const inputConvert = this.decodeHexBigNumberInput(inputs, names);
        const { hash, blockNumber, from, to, timeStamp } = item;
        await this.modelTransactionLog.findOneAndUpdate(
          { hash },
          {
            hash,
            blockNumber,
            timeStamp,
            method,
            inputs: inputConvert,
            address: from,
            from,
            to,
            linkBsc: LINK_BSC(hash),
          },
          { upsert: true, new: true },
        );
      }
      console.log("SCAN HISTORY SUCCESSFULLY");
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.log(`Request timed out after ${AXIOS_TIME_OUT}ms`);
        throw error;
      }
      console.log(error?.message);
      throw error;
    }
  }

  async getTransaction(props: TransactionLogDto) {
    try {
      const { address, method, page, limit, sort } = props;

      const query = {};
      if (method) {
        const methodArray = method.split(",").map((m) => m.trim());
        query["method"] = { $in: methodArray };
      }
      if (address) {
        query["address"] = address;
      }
      const options: any = {};
      if (page && limit) {
        const skip = (page - 1) * limit;
        options.skip = skip;
        options.limit = limit;
      }
      if (sort === "asc") {
        options.sort = { timeStamp: 1 };
      } else if (sort === "desc") {
        options.sort = { timeStamp: -1 };
      }

      const [rows, total] = await Promise.all([
        this.modelTransactionLog.find(query, null, options).exec(),
        this.modelTransactionLog.countDocuments(query).exec(),
      ]);
      return { rows, total };
    } catch (error) {
      throw error;
    }
  }

  decodeHexBigNumberInput(input: any[], name: any[]) {
    const dataConvert = input.reduce((pre, cur, i) => {
      pre.push({
        name: name[i] ? name[i] : null,
        type: "BigNumber",
        hex: parseInt(cur["_hex"], 16),
      });
      return pre;
    }, []);
    return dataConvert;
  }

  async countAllTxn() {
    return this.modelTransactionLog.count({
      method: { $in: ["mint", "redeem"] },
    });
  }
}
