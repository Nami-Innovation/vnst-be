import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import env from "@utils/constant/env";
import { UnAuthorizedException } from "@config/exception.config";
import { AuthDto } from "./dto/auth.dto";
import { WalletsService } from "@modules/wallets/wallets.service";
import { verifyMessage, hashMessage } from "ethers";

@Injectable()
export class AuthService {
  constructor(
    private walletsService: WalletsService,
    private jwtService: JwtService,
  ) {}

  public async loginWithCredentials(loginDTO: AuthDto) {
    const { walletAddress, signature } = loginDTO;

    const wallet = await this.walletsService.findByWalletAddress(walletAddress);

    if (!wallet) {
      throw new UnAuthorizedException("Wallet not found!");
    }
    try {
      const isValid = this.verifySignature(
        walletAddress,
        wallet.nonce,
        signature,
      );
      if (!isValid) {
        throw new Error();
      }
    } catch (error) {
      throw new UnAuthorizedException("Signature is invalid");
    }

    const payload = { _id: wallet._id, walletAddress, signature };

    return {
      accessToken: this.generateToken(payload),
      wallet,
    };
  }

  public verifySignature(
    walletAddress: string,
    nonce: string,
    signature: string,
  ) {
    const address = verifyMessage(hashMessage(nonce), signature);
    return walletAddress === address.toLowerCase();
  }

  public generateToken(payload: any) {
    return this.jwtService.sign(payload, { secret: env.JWT_SECRET_KEY });
  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new UnAuthorizedException("Invalid JWT");
    }
  }

  public generateKeyForMerchant(props: string) {
    return this.generateToken(props);
  }

  public decodeKeyForMerchant(props: string) {
    return this.jwtService.verify(props, { secret: env.JWT_SECRET_KEY });
  }
}
