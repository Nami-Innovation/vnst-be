import { NotificationType } from "src/schema/notification.schema";

export class CreateNotificationDto {
  wallet: string;

  metadata: Record<string, unknown>;

  type: NotificationType;

  read: boolean = false;
}
