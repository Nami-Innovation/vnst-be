import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common";
import { Address, TonClient4, TonClient } from "@ton/ton";
import env from "@utils/constant/env";
import { Buffer } from "buffer";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import {
  TonTransaction,
  TonTransactionDocument,
} from "src/schema/ton-transaction.schema";
import { TransactionParsed, TransactionType } from "./types/transaction";
import { ListTransactionQueryDto } from "./dto/transaction-query.dto";
import { formatUnits } from "ethers";

@Injectable()
export class TonService implements OnModuleInit {
  private readonly tonClient4: TonClient4;
  private tonClient: TonClient;

  constructor(
    @InjectModel(TonTransaction.name)
    private transactionModel: Model<TonTransactionDocument>,
  ) {
    this.tonClient4 = new TonClient4({
      endpoint: env.IS_MAINNET
        ? "https://mainnet-v4.tonhubapi.com"
        : "https://testnet-v4.tonhubapi.com/",
    });
  }

  async onModuleInit() {
    const endpoint = await getHttpEndpoint({
      network: env.IS_MAINNET ? "mainnet" : "testnet",
    });

    this.tonClient = new TonClient({ endpoint });
  }

  async countAllTransactions() {
    return await this.transactionModel.count({
      type: { $in: [TransactionType.MINT, TransactionType.REDEEM] },
    });
  }

  async getStats() {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          type: { $in: [TransactionType.MINT, TransactionType.REDEEM] },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmountIn: { $sum: "$payload.inAmount" },
          totalAmountOut: { $sum: "$payload.outAmount" },
        },
      },
    ]);

    const minted = result.find((r) => r._id === TransactionType.MINT);
    const redeemed = result.find((r) => r._id === TransactionType.REDEEM);
    const mintedTotalAmountIn = minted?.totalAmountIn || 0;
    const mintedTotalAmountOut = minted?.totalAmountOut || 0;
    const redeemedTotalAmountIn = redeemed?.totalAmountIn || 0;
    const redeemedTotalAmountOut = redeemed?.totalAmountOut || 0;

    return {
      minted: mintedTotalAmountOut,
      redeemed: redeemedTotalAmountIn,
      totalVNST: mintedTotalAmountOut - redeemedTotalAmountIn,
      totalUSDT: mintedTotalAmountIn - redeemedTotalAmountOut,
    };
  }

  // get Transactions trong DB
  async getTransactions(query: ListTransactionQueryDto) {
    const filter: FilterQuery<TonTransaction> = {};
    if (query.walletAddress) {
      try {
        filter.fromAddress = Address.parse(query.walletAddress).toRawString();
      } catch (error) {
        throw new BadRequestException("Invalid wallet address");
      }
    }

    if (query.hash) filter.hash = query.hash;
    if (query.type) filter.type = query.type;

    const [rows, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(query.skip)
        .limit(query.limit),
      this.transactionModel.count(filter),
    ]);

    return {
      rows,
      total,
    };
  }

  async createTransaction(data: TransactionParsed) {
    const transaction = new this.transactionModel(data);
    return await transaction.save();
  }

  async getLastTransaction() {
    return await this.transactionModel.findOne().sort({ timestamp: -1 });
  }

  async getMarketPrice() {
    const result = await this.tonClient.runMethod(
      env.TON_SMC_ADDRESS,
      "get_market_price",
    );

    return Number(formatUnits(result.stack.readBigNumber(), 6));
  }

  async getOperationPool() {
    try {
      const result = await this.tonClient.runMethod(
        env.TON_SMC_ADDRESS,
        "get_operation_pool",
      );

      return Number(formatUnits(result.stack.readBigNumber(), 6));
    } catch (error) {
      console.error("getOperationPool", error);
      return 0;
    }
  }

  /**
   * Get wallet public key by address.
   */
  public async getWalletPublicKey(address: string): Promise<Buffer> {
    const masterAt = await this.tonClient4.getLastBlock();
    const result = await this.tonClient4.runMethod(
      masterAt.last.seqno,
      Address.parse(address),
      "get_public_key",
      [],
    );

    return Buffer.from(
      result.reader.readBigNumber().toString(16).padStart(64, "0"),
      "hex",
    );
  }

  /**
   * Get account info by address.
   */
  public async getAccountInfo(
    address: string,
  ): Promise<ReturnType<TonClient4["getAccount"]>> {
    const masterAt = await this.tonClient4.getLastBlock();
    return await this.tonClient4.getAccount(
      masterAt.last.seqno,
      Address.parse(address),
    );
  }
}
