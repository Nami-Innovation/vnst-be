import { Controller, Get, Logger, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ROUTER_TRANSACTION_LOG } from "@utils/router/transaction-log.router";
import { TransactionLogService } from "./transaction-log.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TransactionLogDto } from "./dto/transaction-log.dto";

@ApiTags("Transaction-Log")
@Controller(ROUTER_TRANSACTION_LOG)
export class TransactionLogController {
  private readonly logger = new Logger(TransactionLogService.name);
  constructor(private readonly transactionLogService: TransactionLogService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  scanTransaction() {
    this.logger.debug("SCAN HISTORY");
    return this.transactionLogService.transactionLogJob();
  }

  @Get()
  getOneAddress(@Query() query: TransactionLogDto) {
    return this.transactionLogService.getTransaction(query);
  }
}
