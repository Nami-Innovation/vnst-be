import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import dayjs from "dayjs";
import { TokenPrice, TokenPriceDocument } from "src/schema/token-price.schema";
import { Token } from "@utils/constant/token";
import { TokenPriceChartDto } from "./dto/token-price.dto";
import { TimeRange } from "./token-price.constants";

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

@Injectable()
export class TokenPriceService {
  constructor(
    @InjectModel(TokenPrice.name)
    private readonly tokenPriceModel: Model<TokenPriceDocument>,
  ) {
    // this.seed()
  }

  seed() {
    let startDate = dayjs().subtract(1, "month").startOf("day");

    const curentDate = dayjs();

    while (startDate.isBefore(curentDate)) {
      const price = getRandomArbitrary(24300, 24800);
      this.tokenPriceModel.create({
        token: Token.USDT,
        price,
        time: startDate.toDate(),
      });

      startDate = startDate.add(5, "minutes");
    }
  }

  async getTokenPriceChart(query: TokenPriceChartDto) {
    let startDate: Date;
    let groupTime: any;
    const timezone = "Asia/Ho_Chi_Minh";

    switch (query.range) {
      case TimeRange.Day:
        startDate = dayjs().subtract(1, "day").startOf("hour").toDate();
        groupTime = {
          year: { $year: "$time" },
          month: { $month: "$time" },
          day: { $dayOfMonth: "$time" },
          hour: { $hour: "$time" },
        };
        break;
      case TimeRange.Week:
        startDate = dayjs().subtract(7, "days").startOf("day").toDate();
        groupTime = {
          year: { $year: "$time" },
          month: { $month: "$time" },
          day: { $dayOfMonth: "$time" },
          timezone
        };
        break;
      case TimeRange.Month:
        startDate = dayjs().subtract(1, "months").startOf("day").toDate();
        groupTime = {
          year: { $year: "$time" },
          month: { $month: "$time" },
          day: { $dayOfMonth: "$time" },
          timezone
        };
        break;
      case TimeRange.Year:
        startDate = dayjs().subtract(1, "year").startOf("day").toDate();
        groupTime = {
          year: { $year: "$time" },
          month: { $month: "$time" },
          timezone
        };
        break;
      default:
        break;
    }

    const results = await this.tokenPriceModel.aggregate([
      {
        $match: {
          time: {
            $gte: startDate,
          },
          token: query.token,
        },
      },
      {
        $group: {
          _id: {
            $dateFromParts: groupTime,
          },
          price: {
            $avg: "$price",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          timestamp: {
            $subtract: ["$_id", new Date("1970-01-01")],
          },
          price: "$price",
        },
      },
    ]);
    return results.map(({ _id, ...rest }) => rest);
  }
}
