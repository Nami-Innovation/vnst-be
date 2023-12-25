import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MerchantSubscriberDocument = MerchantSubscriber & Document;

@Schema({
  timestamps: true,
  collection: "merchant-subscriber",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class MerchantSubscriber {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: false,
  })
  email?: string;

  @Prop({
    type: String,
    required: false,
  })
  telegramId?: string;
}

export const MerchantSubscriberSchema =
  SchemaFactory.createForClass(MerchantSubscriber);
