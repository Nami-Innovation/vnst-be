import { ApiProperty } from "@nestjs/swagger";
import { CHAIN_ID } from "@utils/constant/chains";
import { Transform, Type } from "class-transformer";
import { IsMongoId, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { LIQUIDITY_SUPPORT_TYPE } from "../merchant.constants";
import { PaginationQueryDto } from "@utils/dto/pagination-query.dto";
import { Token } from "@utils/constant/token";

export class LiquiditySupportQueryDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  merchant?: string;

  @ApiProperty({
    type: Number,
    enum: [CHAIN_ID.BSC, CHAIN_ID.ETH],
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CHAIN_ID)
  chainId?: CHAIN_ID;

  @ApiProperty({
    enum: Token,
    required: false,
  })
  @IsOptional()
  @IsEnum(Token)
  token?: Token;

  @ApiProperty({
    enum: Object.values(LIQUIDITY_SUPPORT_TYPE),
    required: false,
  })
  @IsOptional()
  @IsEnum(LIQUIDITY_SUPPORT_TYPE)
  type?: LIQUIDITY_SUPPORT_TYPE;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  from?: number;

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  to?: number;
}
