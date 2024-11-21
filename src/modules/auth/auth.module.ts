import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import env from "@utils/constant/env";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";
import { WalletsModule } from "@modules/wallets/wallets.module";
import { AuthController } from "./auth.controller";
import { TonModule } from "@modules/ton/ton.module";

@Module({
  imports: [
    WalletsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: 1000 * 60 * 60 * 6, // 6 hour,
      },
    }),
    TonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
