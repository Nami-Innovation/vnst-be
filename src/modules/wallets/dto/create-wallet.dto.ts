import { NETWORK } from "@utils/constant/chains";
import { IsBoolean } from "class-validator";

export class CreateWalletDto {
  walletAddress: string;

  email?: string;

  @IsBoolean()
  enabledNoti?: boolean;

  nonce?: string;

  network: NETWORK;

  balance?: number = 0;
}
