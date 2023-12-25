import { Controller, Get, Query, Res } from "@nestjs/common";
import { ROUTER_MERCHANT } from "@utils/router/merchant.router";
import { MerchantService } from "./merchant.service";
import { ApiTags } from "@nestjs/swagger";
import { MerchantAnalyticDto } from "@modules/merchant/dto/merchant-analytic.dto";
import { MerchantChartDto } from "@modules/merchant/dto/merchant-chart.dto";
import { HttpService } from "@nestjs/axios";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";

@ApiTags("Merchant")
@Controller(ROUTER_MERCHANT)
export class MerchantController {
  private namiExchangeApiUrl = "";

  constructor(
    private readonly merchantService: MerchantService,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.namiExchangeApiUrl = this.config.get("END_POINT_NAMI");
  }

  @Get("/analytic")
  async merchantAnalytic(
    @Query() query: MerchantAnalyticDto,
    @Res() res: Response,
  ) {
    const axiosRequest = await this.httpService.axiosRef.get(
      this.namiExchangeApiUrl + "/api/v3/nao-dashboard/statistic-v2",
      {
        params: query,
        responseType: "stream",
      },
    );

    axiosRequest.data.pipe(res);
  }

  @Get("/chart")
  async merchantChart(@Query() query: MerchantChartDto, @Res() res: Response) {
    const axiosRequest = await this.httpService.axiosRef.get(
      this.namiExchangeApiUrl + "/api/v3/nao-dashboard/statistic/chart",
      {
        params: query,
        responseType: "stream",
      },
    );

    return axiosRequest.data.pipe(res);
  }
}
