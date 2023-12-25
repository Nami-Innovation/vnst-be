import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class EmailDto {
  @ApiProperty({
    type: String,
    example: "tunglt@nami.trade",
  })
  @IsEmail()
  recipient: string;

  @ApiProperty({
    type: String,
    example: "Welcome To Nami Innovation",
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    example: "Name",
  })
  @IsOptional()
  text?: any;
}

export class EmailOtpDto {
  @ApiProperty({
    type: String,
    example: "tunglt@nami.trade",
  })
  @IsEmail()
  recipient: string;

  @ApiProperty({
    type: String,
    example: "Welcome To Nami Innovation",
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    example: "Name",
  })
  @IsString()
  otp: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  walletAddress: string;
}
