import { IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Transformation } from "src/pipe/transform.pipe";

export class CalCoverPayoutDto {
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  margin: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_market: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_claim: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  hedge: number;

  // 1 - 15 days
  @ApiProperty({ type: Number, example: 6 })
  @Transform(({ value }) => Transformation.validateNumber(value, 1, 15))
  // @IsPositive()
  period: number;

  // new logic
  @ApiProperty({
    required: true,
    type: Number,
    description: "avg_day_change.BTCUSDT[period - 1]",
  })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  day_change_token: number;

  @IsOptional()
  @ApiProperty({ type: Number })
  @IsNumber()
  q_covered: number;
}

export class CalPStopDto {
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_market: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_claim: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  hedge: number;
}

export class CalLeverageDto {
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_market: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Transformation.parseStringToFloat(value))
  @IsNumber()
  p_stop: number;
}
