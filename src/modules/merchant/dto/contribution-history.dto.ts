import { ApiProperty } from "@nestjs/swagger";
import { PaginationQueryDto } from "@utils/dto/pagination-query.dto";
import { Transform } from "class-transformer";
import { IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class ContributionHistoryQueryDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  merchant?: string;

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
  })
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
