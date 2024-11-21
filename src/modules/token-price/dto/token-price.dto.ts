import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TimeRange } from "../token-price.constants";
import { Token } from "@utils/constant/token";
import { NetworkQueryDto } from "@utils/dto/chain-query.dto";

export class TokenPriceChartDto extends NetworkQueryDto {
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
