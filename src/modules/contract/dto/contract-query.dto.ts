import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEthereumAddress } from "class-validator";
import { Transformation } from "src/pipe/transform.pipe";

export class BalanceQueryDTO {
  @ApiProperty({
    type: String,
  })
  @IsEthereumAddress()
  @Transform(({ value }) => Transformation.lowerCaseAndTrimString(value))
  address?: string;
}
