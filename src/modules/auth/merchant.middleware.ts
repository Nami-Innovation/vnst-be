import { LoggerService } from "@modules/logger/logger.service";
import { MerchantService } from "@modules/merchant/merchant.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class MerchantGuard implements CanActivate {
  constructor(
    private merchantService: MerchantService,
    private authService: AuthService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { key } = request.headers;

    if (!key) throw new UnauthorizedException();

    // try {
    //   const decodeKey = this.authService.decodeKeyForMerchant(key);
    //   const code = decodeKey?.payload;

    //   LoggerService.log("Check Merchant");

    //   const checkMerchant = this.merchantService
    //     .findOneMerchant(code)
    //     .then((result) => {
    //       if (!result) return false;
    //       context.switchToHttp().getRequest().merchant = result;
    //       return true;
    //     });

    //   return checkMerchant;
    // } catch (e) {
    //   throw new UnauthorizedException();
    // }
    return true
  }
}
