import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Wallet } from "./wallet.schema";

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  MINT = "mint",
  REDEEM = "redeem",
}

@Schema({
  timestamps: true,
  collection: "notifications",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Wallet.name,
    required: true,
    index: -1,
  })
  wallet: Wallet | string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(NotificationType),
  })
  type: NotificationType;

  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  metadata: Record<string, unknown>;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
