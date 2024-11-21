import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationQueryDto } from "@utils/dto/pagination-query.dto";
import { IsOptional, IsString } from "class-validator";
import { TransactionType } from "../types/transaction";

export class ListTransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: String,
    enum: TransactionType,
    nullable: true,
    required: false,
  })
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  walletAddress?: string;
}
