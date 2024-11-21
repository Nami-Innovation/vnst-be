import { Controller, Get, Param, Query } from "@nestjs/common";
import { TonService } from "./ton.service";
import { ListTransactionQueryDto } from "./dto/transaction-query.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("ton")
@ApiTags("Ton")
export class TonController {
  constructor(private readonly tonService: TonService) {}

  @Get("transactions")
  async getTransactions(@Query() query: ListTransactionQueryDto) {
    return this.tonService.getTransactions(query);
  }
}
