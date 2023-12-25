import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsString, Length } from "class-validator";
import { Transformation } from "src/pipe/transform.pipe";

export class UpdateWalletDto {
  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  enabledNoti?: boolean;
}

export class VerifyEmailDto {
  @ApiProperty({
    type: String,
    description: "Email register to get notifications",
  })
  @IsEmail()
  @Transform(({ value }) => Transformation.lowerCaseAndTrimString(value))
  email: string;
}

export class UpdateEmailDto {
  @ApiProperty({
    type: String,
    description: "Email register to get notifications",
  })
  @IsEmail()
  @Transform(({ value }) => Transformation.lowerCaseAndTrimString(value))
  email: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @Length(6, 6)
  otp: string;
}
