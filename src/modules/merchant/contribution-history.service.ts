import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions, Types } from "mongoose";
import {
  ContributionHistory,
  ContributionHistoryDocument,
} from "src/schema/merchant-contribution-history.schema";
import { ContributionHistoryQueryDto } from "./dto/contribution-history.dto";
import dayjs from "dayjs";

@Injectable()
export class ContributionHistoryService {
  constructor(
    @InjectModel(ContributionHistory.name)
    private contributionHistoryModel: Model<ContributionHistoryDocument>,
  ) {}

  async findAll(query: ContributionHistoryQueryDto) {
    const filter: FilterQuery<ContributionHistoryDocument> = {};
    const options: QueryOptions = {};

    if (query.merchant) {
      filter.merchant = query.merchant;
    }

    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt["$gte"] = dayjs(query.from).toDate();
      if (query.to) filter.createdAt["$lte"] = dayjs(query.to).toDate();
    }

    options.skip = (query.page - 1) * query.limit;
    options.limit = query.limit;

    options.sort = query.sort || "-createdAt";

    const [rows, total] = await Promise.all([
      this.contributionHistoryModel
        .find(filter, null, options)
        .populate("merchant", "name code walletAddress")
        .exec(),
      this.contributionHistoryModel.count(filter),
    ]);

    return {
      rows,
      total,
    };
  }

  async getTotalContributions() {
    const results = await this.contributionHistoryModel.aggregate([
      {
        $group: {
          _id: "$token",
          total: { $sum: "$amount" },
        },
      },
    ]);
    return results.reduce((totals, item) => {
      totals[item._id] = item.total;
      return totals;
    }, {});
  }
}
