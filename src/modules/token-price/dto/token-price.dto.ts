import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TimeRange } from "../token-price.constants";
import { Token } from "@utils/constant/token";

export class TokenPriceChartDto {
  @ApiProperty({
    enum: Object.values(TimeRange),
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeRange)
  range: TimeRange = TimeRange.Day;

  @ApiProperty({
    enum: Object.values(Token),
    required: false,
  })
  @IsOptional()
  @IsEnum(Token)
  token: Token = Token.USDT;
}
