import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import env from "@utils/constant/env";
import { UnAuthorizedException } from "@config/exception.config";
import { AuthDto } from "./dto/auth.dto";
import { WalletsService } from "@modules/wallets/wallets.service";
import { verifyMessage, hashMessage } from "ethers";
import { NETWORK, TON_CHAIN } from "@utils/constant/chains";
import { TonProofService } from "@modules/ton/ton-proof.service";
import { CheckProofDto } from "@modules/ton/dto/check-proof.dto";

@Injectable()
export class AuthService {
  constructor(
    private walletsService: WalletsService,
    private jwtService: JwtService,
    private tonProofService: TonProofService,
  ) {}

  public async loginEVM(loginDTO: AuthDto) {
    const { walletAddress, signature } = loginDTO;

    const wallet = await this.walletsService.getWalletDetail(
      walletAddress.toLowerCase(),
      NETWORK.BNB,
    );

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

    const payload = { _id: wallet._id, walletAddress, network: NETWORK.BNB };

    return {
      accessToken: await this.generateToken(payload),
      wallet,
    };
  }

  public async loginTon(data: CheckProofDto) {
    const chain = env.IS_MAINNET ? TON_CHAIN.MAINNET : TON_CHAIN.TESTNET;
    if (data.network !== chain) {
      throw new UnAuthorizedException("Invalid network");
    }
    await this.verifyJwt(data.proof.payload);
    const isValid = await this.tonProofService.checkProof(data);
    if (!isValid) {
      throw new UnAuthorizedException("Invalid proof");
    }
    let wallet = await this.walletsService.getWalletDetail(
      data.address,
      NETWORK.TON,
    );

    if (!wallet) {
      wallet = await this.walletsService.create({
        walletAddress: data.address,
        network: NETWORK.TON,
      });
    }

    const payload = {
      _id: wallet._id,
      walletAddress: wallet.walletAddress,
      network: NETWORK.TON,
    };

    return {
      accessToken: await this.generateToken(payload),
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

  public async generateToken(payload: any, options: JwtSignOptions = {}) {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_SECRET_KEY,
      ...options,
    });
  }

  async verifyJwt(
    jwt: string,
    options: JwtVerifyOptions = {},
  ): Promise<{ exp: number }> {
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt, {
        secret: env.JWT_SECRET_KEY,
        ...options,
      });
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
