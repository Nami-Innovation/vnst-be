import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

//https://test.nami.exchange/api/v3/nao-dashboard/statistic/chart?range=custom&from=1690822800000&to=1694106000000&marginCurrency=39
export class MerchantChartDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  range: string;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  to: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  marginCurrency: string;
}
