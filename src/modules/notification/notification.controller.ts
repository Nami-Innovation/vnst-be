import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { NotificationQueryDTO } from "./dto/notification-query.dto";
import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import { WalletsService } from "@modules/wallets/wallets.service";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { ParseObjectIdPipe } from "src/pipe/parse-object-id.pipe";
import { UnAuthorizedException } from "@config/exception.config";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly walletsService: WalletsService,
  ) {}

  @Get("/")
  async findAll(@Req() req, @Query() query: NotificationQueryDTO) {
    query.walletId = req.user._id;

    const wallet = await this.walletsService.findOne(query.walletId);

    if (!wallet) {
      throw new BadRequestException("Wallet not found");
    }
    return this.notificationService.findAll(query);
  }

  @Put("/:id")
  async update(
    @Req() req,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() body: UpdateNotificationDto,
  ) {
    const notification = await this.notificationService.findById(id);
    if (!notification) {
      throw new NotFoundException("Notification is not found");
    }

    if (notification.wallet.toString() !== req.user._id) {
      throw new UnAuthorizedException("Authorization failed!");
    }

    return this.notificationService.updateOne(id, body);
  }
}
