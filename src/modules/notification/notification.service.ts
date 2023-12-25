import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import {
  Notification,
  NotificationDocument,
} from "src/schema/notification.schema";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationQueryDTO } from "./dto/notification-query.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  create(notificationDto: CreateNotificationDto) {
    return this.notificationModel.create(notificationDto);
  }

  async findAll(query: NotificationQueryDTO) {
    const filter: FilterQuery<NotificationDocument> = {
      wallet: query.walletId,
    };
    const options: QueryOptions = {
      skip: query.offset,
      limit: query.limit,
      sort: query.sort || "-createdAt",
    };

    if (query.type) {
      filter.type = query.type;
    }

    const [rows, total] = await Promise.all([
      this.notificationModel.find(filter, null, options),
      this.notificationModel.count(filter),
    ]);

    return {
      rows,
      total,
    };
  }

  findById(id: string) {
    return this.notificationModel.findById(id);
  }

  updateOne(id: string, data: UpdateNotificationDto) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { read: data.read },
      { new: true },
    );
  }
}
