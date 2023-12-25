import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { LiquiditySupportQueryDto } from "./dto/liquidity-support.dto";
import {
  LiquiditySupport,
  LiquiditySupportDocument,
} from "src/schema/merchant-liquidity-support.schema";
import dayjs from "dayjs";

@Injectable()
export class LiquiditySupportService {
  constructor(
    @InjectModel(LiquiditySupport.name)
    private liquiditySupportModel: Model<LiquiditySupportDocument>,
  ) {}
  async findAll(query: LiquiditySupportQueryDto) {
    const filter: FilterQuery<LiquiditySupportDocument> = {};
    const options: QueryOptions = {};

    if (query.merchant) {
      filter.merchant = query.merchant;
    }

    if (query.chainId) filter.chainId = query.chainId;
    if (query.token) filter.token = query.token;
    if (query.type) filter.type = query.type;

    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt["$gte"] = dayjs(query.from).toDate();
      if (query.to) filter.createdAt["$lte"] = dayjs(query.to).toDate();
    }

    options.skip = query.skip;
    options.limit = query.limit;

    options.sort = query.sort || "-createdAt";

    const [rows, total] = await Promise.all([
      this.liquiditySupportModel
        .find(filter, null, options)
        .populate("merchant", "name code walletAddress")
        .exec(),
      this.liquiditySupportModel.count(filter),
    ]);

    return {
      rows,
      total,
    };
  }

  async getTotalLiquidity() {
    const results = await this.liquiditySupportModel.aggregate([
      {
        $group: {
          _id: "$token",
          totalIn: {
            $sum: {
              $cond: [{ $eq: ["$type", "IN"] }, "$amount", 0],
            },
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ["$type", "OUT"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          netTotal: { $subtract: ["$totalOut", "$totalIn"] },
        },
      },
    ]);
    return results.reduce((totals, item) => {
      totals[item._id] = item.netTotal;
      return totals;
    }, {});
  }
}
