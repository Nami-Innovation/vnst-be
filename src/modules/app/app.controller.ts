import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { WalletsService } from "@modules/wallets/wallets.service";
import { EventLogsService } from "@modules/event-logs/event-logs.service";
// import { TransactionLogService } from "@modules/transaction-log/transaction-log.service";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { ContractService } from "@modules/contract/contract.service";

@Controller()
export class AppController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly eventLogsService: EventLogsService,
    // private readonly transactionLogService: TransactionLogService,
    private readonly contractService: ContractService,
  ) {}

  @Get("/stats")
  @CacheTTL(60)
  @UseInterceptors(CacheInterceptor)
  async getStats() {
    const [minted, redeemed, transactions, holders, operationPool] =
      await Promise.all([
        this.eventLogsService.getAmountMinted(),
        this.eventLogsService.getAmountRedeemed(),
        this.eventLogsService.countAllTxn(),
        this.walletsService.countHolders(),
        this.contractService.getOperationPool(),
      ]);

    const totalVNST = minted.amountOut - redeemed.amountIn;
    const totalUSDT = minted.amountIn - redeemed.amountOut;

    const stats = {
      holders,
      minted: minted.amountOut,
      redeemed: redeemed.amountIn,
      transactions,
      totalVNST: totalVNST > 0 ? totalVNST : 0,
      totalUSDT: totalUSDT > 0 ? totalUSDT : 0,
      operationPool: operationPool,
    };
    return stats;
  }

  @Get("/ping")
  ping() {
    return "pong";
  }
}
