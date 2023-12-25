import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { TRANSACTION_TYPE } from "../transaction-log.constant";

export class TransactionLogDto {
  @ApiProperty({
    type: String,
    example: "0xff9956d1219aa3483b46a3a01124f862901dc4fc",
    nullable: true,
  })
  @IsOptional()
  address: string;

  @ApiProperty({
    type: String,
    example: `${TRANSACTION_TYPE.MINT},${TRANSACTION_TYPE.BURN}`,
    nullable: true,
  })
  @IsOptional()
  method: string;

  @ApiProperty({
    type: Number,
    example: 1,
    nullable: true,
  })
  @IsOptional()
  page: number;

  @ApiProperty({
    type: Number,
    example: 10,
    nullable: true,
  })
  @IsOptional()
  limit: number;

  @ApiProperty({
    type: String,
    example: "desc",
    nullable: true,
  })
  @IsOptional()
  sort: string;
}
