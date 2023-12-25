import { ApiTags } from "@nestjs/swagger";
import { LiquiditySupportService } from "./liquidity-support.service";
import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { LiquiditySupportQueryDto } from "./dto/liquidity-support.dto";
import { CacheTTL, CacheInterceptor } from "@nestjs/cache-manager";

@ApiTags("Merchant Liquidity Support")
@Controller("merchants/liquidity-support")
export class LiquiditySupportController {
  constructor(
    private readonly liquiditySupportService: LiquiditySupportService,
  ) {}
  @Get()
  findAll(@Query() query: LiquiditySupportQueryDto) {
    return this.liquiditySupportService.findAll(query);
  }

  @Get("/total-liquidity")
  @CacheTTL(300)
  @UseInterceptors(CacheInterceptor)
  getTotalContributions() {
    return this.liquiditySupportService.getTotalLiquidity();
  }
}
