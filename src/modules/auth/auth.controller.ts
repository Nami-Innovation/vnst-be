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

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private walletsService: WalletsService,
  ) {}

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.loginWithCredentials(body);

    res.cookie("access-token", data.accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return data;
  }

  @Get("/nonce")
  async getNonce(@Query() query: NonceQueryDTO) {
    const nonce = await this.walletsService.getNonce(query.walletAddress);
    return { nonce };
  }
}
