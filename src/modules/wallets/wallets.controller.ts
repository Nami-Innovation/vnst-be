import {
  Controller,
  Body,
  Get,
  UseGuards,
  Req,
  Put,
  Post,
  NotFoundException,
} from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  UpdateEmailDto,
  UpdateWalletDto,
  VerifyEmailDto,
} from "./dto/update-wallet.dto";
import { ApiTags } from "@nestjs/swagger";
import { NETWORK } from "@utils/constant/chains";

@ApiTags("Wallets")
@Controller("wallets")
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get("/me")
  async getProfile(@Req() req) {
    return this.walletsService.getWalletDetail(
      req.user.walletAddress,
      req.user.network,
    );
  }

  @Put("/update-me")
  async updateMe(@Req() req, @Body() body: UpdateWalletDto) {
    return this.walletsService.update(req.user.walletAddress, body);
  }

  @Post("/verify-email")
  async verifyEmail(@Req() req, @Body() data: VerifyEmailDto) {
    const walletAddress = req.user.walletAddress;

    const wallet = await this.walletsService.findByWalletAddress(walletAddress);
    if (!wallet) {
      throw new NotFoundException("wallet not found");
    }

    await this.walletsService.verifyEmail(wallet, data.email);
    return {
      success: true,
    };
  }

  @Put("/update-email")
  async updateEmail(@Req() req, @Body() data: UpdateEmailDto) {
    const walletAddress = req.user.walletAddress;

    const wallet = await this.walletsService.findByWalletAddress(walletAddress);
    if (!wallet) {
      throw new NotFoundException("wallet not found");
    }
    return this.walletsService.updateEmail(wallet, data);
  }

  @Get("/scan-balance")
  scanBalance() {
    return this.walletsService.scanBalance();
  }
}
