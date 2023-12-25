import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, Matches } from "class-validator";

export class MerchantSubscriberDto {
  @IsString()
  @ApiProperty({
    type: String,
    default: "BabyShark",
  })
  name: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    type: String,
    default: "babyShark@nami.trade",
  })
  email?: string;

  @IsOptional()
  @Matches(/^@\w{5,32}$/, {
    message: "invalid_telegramId_format",
  })
  @ApiProperty({
    type: String,
    default: "@babyShark",
  })
  telegramId?: string;
}
