import { ApiProperty } from "@nestjs/swagger";
import { PaginationQueryOffsetDto } from "@utils/dto/pagination-query.dto";
import { IsEnum, IsOptional } from "class-validator";
import { NotificationType } from "src/schema/notification.schema";

export class NotificationQueryDTO extends PaginationQueryOffsetDto {
  walletId: string;

  @ApiProperty({
    type: NotificationType,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
