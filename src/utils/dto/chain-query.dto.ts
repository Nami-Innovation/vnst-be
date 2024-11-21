import { ApiPropertyOptional } from "@nestjs/swagger";
import { NETWORK } from "@utils/constant/chains";
import { IsEnum, IsOptional } from "class-validator";

export class NetworkQueryDto {
  @ApiPropertyOptional({
    enum: NETWORK,
  })
  @IsOptional()
  @IsEnum(NETWORK)
  readonly network?: NETWORK = NETWORK.BNB;
}
