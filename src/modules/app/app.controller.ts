import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { WalletsService } from "@modules/wallets/wallets.service";
import { EventLogsService } from "@modules/event-logs/event-logs.service";
// import { TransactionLogService } from "@modules/transaction-log/transaction-log.service";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { ContractService } from "@modules/contract/contract.service";
import { NetworkQueryDto } from "@utils/dto/chain-query.dto";
import { NETWORK } from "@utils/constant/chains";
import { TonService } from "@modules/ton/ton.service";

@Controller()
export class AppController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly eventLogsService: EventLogsService,
    // private readonly transactionLogService: TransactionLogService,
    private readonly contractService: ContractService,
    private readonly tonService: TonService,
  ) {}

  @Get("/stats")
  @CacheTTL(60)
  @UseInterceptors(CacheInterceptor)
  async getStats(@Query() query: NetworkQueryDto) {
    if (query.network === NETWORK.TON) {
      const [stats, transactions, holders, operationPool] = await Promise.all([
        this.tonService.getStats(),
        this.tonService.countAllTransactions(),
        this.walletsService.countHolders(query.network),
        this.tonService.getOperationPool(),
      ]);
      
      return {
        ...stats,
        transactions,
        holders,
        operationPool,
      };
    }

    const [minted, redeemed, transactions, holders, operationPool] =
      await Promise.all([
        this.eventLogsService.getAmountMinted(),
        this.eventLogsService.getAmountRedeemed(),
        this.eventLogsService.countAllTxn(),
        this.walletsService.countHolders(query.network),
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

  @Get("/totalcoins")
  async getTotalSupply() {
    const totalSupply = this.contractService.getTotalSupply();

    return totalSupply;
  }

  @Get("/circulating")
  async getCirculating() {
    const circulating = this.contractService.getTotalSupply();

    return circulating;
  }
}
