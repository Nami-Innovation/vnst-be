import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const MerchantDec = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request?.merchant;
  },
);
