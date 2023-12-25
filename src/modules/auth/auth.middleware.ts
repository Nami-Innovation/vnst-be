import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtPayload, verify } from "jsonwebtoken";
import env from "@utils/constant/env";

export type TokenPayLoad = {
  owner: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization) throw new UnauthorizedException();
    try {
      const payload = verify(
        authorization.replace("Bearer", "").trim(),
        env.JWT_SECRET_KEY,
      ) as JwtPayload;
      if (!payload?.payload) throw new UnauthorizedException();
      context.switchToHttp().getRequest().owner = payload?.payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
