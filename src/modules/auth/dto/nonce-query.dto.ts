import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEthereumAddress,
  IsNotEmpty,
} from "class-validator";
import { Transformation } from "src/pipe/transform.pipe";

export class NonceQueryDTO {
  @ApiProperty({
    type: String,
    description: "Etherium address",
    example: "0xFA39a930C7A3D1fEde4E1348FF74c0c5ba93D2B4",
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  @Transform(({ value }) => Transformation.lowerCaseAndTrimString(value))
  walletAddress: string;
}
