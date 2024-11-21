import { TON_CHAIN } from "@utils/constant/chains";
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

class Domain {
  @IsNumber()
  @IsPositive()
  lengthBytes: number;

  @IsString()
  value: string;
}

class Proof {
  @IsNumber()
  timestamp: number;

  @ValidateNested()
  domain: Domain;

  @IsString()
  payload: string;

  @IsString()
  signature: string;

  @IsString()
  stateInit: string;
}

export class CheckProofDto {
  @IsString()
  address: string;

  @IsString()
  @IsEnum(TON_CHAIN)
  network: string;

  @IsString()
  publicKey: string;

  @ValidateNested()
  proof: Proof;
}
