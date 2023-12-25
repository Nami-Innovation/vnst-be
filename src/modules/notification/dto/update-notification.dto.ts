import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateNotificationDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  read: boolean;
}
