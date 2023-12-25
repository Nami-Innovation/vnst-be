import { ApiProperty } from "@nestjs/swagger";
import { PaginationQueryDto } from "@utils/dto/pagination-query.dto";
import { Transform } from "class-transformer";
import {
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transformation } from "src/pipe/transform.pipe";

export class EventLogQueryDTO extends PaginationQueryDto {
  @ApiProperty({
    type: String,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress()
  @Transform(({ value }) => Transformation.lowerCaseAndTrimString(value))
  walletAddress?: string;
}

export class EventLogQueryByTransactionDTO {
  @ApiProperty({
    type: String,
  })
  @IsString()
  blockHash: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  transactionHash: string;

  @ApiProperty({
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  blockNumber: number;
}
