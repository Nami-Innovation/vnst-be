import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Response } from "express";
import { WalletsService } from "@modules/wallets/wallets.service";
import { NonceQueryDTO } from "./dto/nonce-query.dto";
import { ApiTags } from "@nestjs/swagger";
import { TonProofService } from "@modules/ton/ton-proof.service";
import { CheckProofDto } from "@modules/ton/dto/check-proof.dto";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private walletsService: WalletsService,
    private tonProofService: TonProofService,
  ) {}

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.loginEVM(body);

    res.cookie("access-token", data.accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return data;
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access-token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

  @Get("/nonce")
  async getNonce(@Query() query: NonceQueryDTO) {
    const nonce = await this.walletsService.getNonce(query.walletAddress);
    return { nonce };
  }

  @Get("/ton/generate-payload")
  async generatePayload() {
    const payload = this.tonProofService.generatePayload();
    const payloadToken = await this.authService.generateToken(
      { payload },
      {
        algorithm: "HS256",
        expiresIn: "15m", // 15 minutes
      },
    );

    return {
      payload: payloadToken,
    };
  }

  @Post("/ton/login")
  async tonLogin(
    @Body() body: CheckProofDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.loginTon(body);

    res.cookie("access-token", data.accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return data;
  }
}
