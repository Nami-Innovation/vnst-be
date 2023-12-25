import { IsString } from "class-validator";

export class GetPriceTokenDto {
  @IsString()
  symbol: string;
}

export class CustomExceptionDto {
  statusCode: number;
  data?: any;
  message?: string;
  error?: any;
  timestamp?: Date | string;
}
