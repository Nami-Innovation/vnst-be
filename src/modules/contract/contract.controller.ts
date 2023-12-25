import { Controller, Get, Query } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { ApiTags } from "@nestjs/swagger";
import { BalanceQueryDTO } from "./dto/contract-query.dto";

@ApiTags("Contract")
@Controller("contract")
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get("otc-delta")
  async getOtcDelta() {
    return {
      otcDelta: await this.contractService.getOtcDeltaSetting(),
    };
  }

  @Get("balance-of")
  getBalanceOf(@Query() query: BalanceQueryDTO) {
    return this.contractService.getBalanceOf(query.address);
  }
}