import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { FilterQuery, QueryOptions, Model } from "mongoose";
import { EventLog, EventLogDocument } from "src/schema/event-log.schema";
import {
  EventLogQueryByTransactionDTO,
  EventLogQueryDTO,
} from "./dto/event-log-query.dto";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ContractService } from "@modules/contract/contract.service";
import { isEthereumAddress } from "class-validator";
import { CACHE_LAST_SCAN_BLOCK_NUMBER, EventName } from "./event-logs.constant";
import { CHAIN_ID } from "@utils/constant/chains";
import { sleep } from "@utils/helpers";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

interface EventLogWeb3 {
  readonly event: string;
  readonly id?: string;
  readonly logIndex?: bigint | number | string;
  readonly transactionIndex?: bigint | number | string;
  readonly transactionHash?: string;
  readonly blockHash?: string;
  readonly blockNumber?: bigint | number | string;
  readonly address: string;
  readonly topics: string[];
  readonly data: string;
  readonly raw?: {
    data: string;
    topics: unknown[];
  };
  readonly returnValues: Record<string, unknown>;
  readonly signature?: string;
}

@Injectable()
export class EventLogsService {
  private readonly logger = new Logger(EventLogsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly contractService: ContractService,
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLogDocument>,
    @InjectQueue("eventLog") private readonly eventLogQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron("0 * * * * *")
  async scanEventLog() {
    try {
      let fromBlock = 0;
      const maxBlockRange = 5000;

      try {
        const lastBlockNumber = await this.cacheManager.get<number>(
          CACHE_LAST_SCAN_BLOCK_NUMBER,
        );
        if (lastBlockNumber > 0) {
          fromBlock = lastBlockNumber;
        }
        console.log("lastBlockNumber", lastBlockNumber);
      } catch (error) {
        this.logger.error(
          "GET CACHE_LAST_SCAN_BLOCK_NUMBER Failed: " + error.message,
        );
      }

      if (!fromBlock) {
        const lastestEvent = await this.eventLogModel
          .findOne()
          .select("blockNumber")
          .sort({ blockNumber: -1 })
          .exec();

        fromBlock = lastestEvent
          ? lastestEvent.blockNumber + 1
          : Number(this.config.get("DEFAULT_START_BLOCK_NUMBER"));
        if (!fromBlock) fromBlock = 0;
      }

      const currentBlockNumber = Number(
        await this.contractService.getBlockNumber(),
      );
      let result: EventLog[] = [];
      const addressTransfered = [];
      const vnstContract = this.contractService.getContract();
      while (fromBlock <= currentBlockNumber) {
        let toBlock = fromBlock + maxBlockRange;
        if (toBlock > currentBlockNumber) toBlock = currentBlockNumber;
        const eventLogs = await vnstContract.getPastEvents({
          fromBlock: fromBlock,
          toBlock: toBlock,
        });

        eventLogs.forEach((eventLog: EventLogWeb3) => {
          if (eventLog.event === EventName.TRANSFER) {
            addressTransfered.push(eventLog.returnValues.from);
            addressTransfered.push(eventLog.returnValues.to);
          }

          result.push(this.parseEventLog(eventLog, CHAIN_ID.BSC));
        });
        await sleep(500);
        fromBlock += maxBlockRange;
      }
      const uniqAddressTransfered = [...new Set(addressTransfered)];
      if (uniqAddressTransfered.length > 0) {
        await this.eventLogQueue.addBulk(
          uniqAddressTransfered.map((address) => ({
            name: "updateBalance",
            data: address,
          })),
        );
      }

      if (result.length > 0) {
        await this.eventLogQueue.addBulk(
          result.map((eventLog) => ({
            name: "insertEventLog",
            data: eventLog,
          })),
        );
      }

      await this.cacheManager.set(
        CACHE_LAST_SCAN_BLOCK_NUMBER,
        currentBlockNumber,
        { ttl: 0 },
      );
    } catch (error) {
      this.logger.error("scanEventLog failed: " + error.message);
    }
  }

  parseEventLog(eventLog: EventLogWeb3, chainId: CHAIN_ID): EventLog {
    return {
      address: eventLog.address,
      data: eventLog.data,
      event: eventLog.event,
      returnValues: this.toObject(eventLog.returnValues),
      topics: eventLog.topics,
      blockHash: eventLog.blockHash,
      blockNumber: Number(eventLog.blockNumber),
      logIndex: Number(eventLog.logIndex),
      raw: eventLog.raw,
      signature: eventLog.signature,
      transactionHash: eventLog.transactionHash,
      transactionIndex: Number(eventLog.transactionIndex),
      chainId,
    };
  }

  async getEventLogByTrasaction(query: EventLogQueryByTransactionDTO) {
    const contract = this.contractService.getContract();
    const events = (await contract.getPastEvents({
      blockHash: query.blockHash,
      fromBlock: query.blockNumber,
      toBlock: query.blockNumber,
    })) as EventLogWeb3[];

    const eventLogs = [];
    const addressTransfered = [];

    events.forEach((e: EventLogWeb3) => {
      if (e.event === EventName.TRANSFER) {
        addressTransfered.push(e.returnValues.from);
        addressTransfered.push(e.returnValues.to);
      }
      eventLogs.push(this.parseEventLog(e, CHAIN_ID.BSC));
    });

    const uniqAddressTransfered = [...new Set(addressTransfered)];
    if (uniqAddressTransfered.length > 0) {
      this.eventLogQueue.addBulk(
        uniqAddressTransfered.map((address) => ({
          name: "updateBalance",
          data: address,
        })),
      );
    }

    if (eventLogs.length > 0) {
      this.eventLogQueue.addBulk(
        eventLogs.map((eventLog) => ({
          name: "insertEventLog",
          data: eventLog,
        })),
      );
    }

    return eventLogs.filter((e) => e.transactionHash === query.transactionHash);
  }

  async findAll(query: EventLogQueryDTO) {
    const address = this.contractService.getAddress();
    const filter: FilterQuery<EventLogDocument> = { address };
    const options: QueryOptions = {};

    if (query.event) {
      const events = query.event.split(",");
      filter.event = {
        $in: events,
      };
    }

    if (query.transactionHash) {
      filter.transactionHash = query.transactionHash;
    }

    if (query.walletAddress) {
      filter["returnValues.0"] = query.walletAddress;
    }

    options.skip = (query.page - 1) * query.limit;
    options.limit = query.limit;

    options.sort = query.sort || "-blockNumber";

    const [rows, total] = await Promise.all([
      this.eventLogModel
        .find(filter, null, options)
        .select("-data -raw -topics -signature")
        .exec(),
      this.eventLogModel.count(filter),
    ]);

    return {
      rows,
      total,
    };
  }

  toObject(object: Record<string, unknown>) {
    return JSON.parse(
      JSON.stringify(object, (key, value) => {
        if (typeof value === "bigint") return value.toString();
        if (isEthereumAddress(value)) return value.toLowerCase();
        return value;
      }),
    );
  }

  getAmountAggregation(event: string) {
    return [
      {
        $match: {
          event,
        },
      },
      {
        $addFields: {
          amountInt: {
            $divide: [
              {
                $toDouble: "$returnValues.1",
              },
              10 ** 18,
            ],
          },
          amountOut: {
            $divide: [
              {
                $toDouble: "$returnValues.2",
              },
              10 ** 18,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmountIn: {
            $sum: "$amountInt",
          },
          totalAmountOut: {
            $sum: "$amountOut",
          },
        },
      },
    ];
  }

  async getAmountMinted() {
    const result = await this.eventLogModel.aggregate(
      this.getAmountAggregation("EMint"),
    );
    return {
      amountIn: result[0]?.totalAmountIn || 0,
      amountOut: result[0]?.totalAmountOut || 0,
    };
  }

  async getAmountRedeemed() {
    const result = await this.eventLogModel.aggregate(
      this.getAmountAggregation("ERedeem"),
    );
    return {
      amountIn: result[0]?.totalAmountIn || 0,
      amountOut: result[0]?.totalAmountOut || 0,
    };
  }

  async countAllTxn() {
    return this.eventLogModel.count({
      event: { $in: [EventName.MINT, EventName.REDEEM] },
    });
  }
}
