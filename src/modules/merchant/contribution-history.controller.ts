import {
  Controller,
  Get,
  Logger,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MerchantService } from "./merchant.service";
import { ContributionHistoryService } from "./contribution-history.service";
import { ContributionHistoryQueryDto } from "./dto/contribution-history.dto";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";

@ApiTags("Merchant Contribution History")
@Controller("merchants/contribution-history")
export class ContributionHistoryController {
  private readonly logger = new Logger(ContributionHistoryController.name);
  constructor(
    private readonly contributionHistoryService: ContributionHistoryService,
    private readonly merchantService: MerchantService,
  ) {}

  @Get()
  findAll(@Query() query: ContributionHistoryQueryDto) {
    return this.contributionHistoryService.findAll(query);
  }

  @Get("/total-contribution")
  @CacheTTL(300)
  @UseInterceptors(CacheInterceptor)
  getTotalContributions() {
    return this.contributionHistoryService.getTotalContributions();
  }
}
