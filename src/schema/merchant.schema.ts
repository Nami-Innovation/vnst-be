import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "merchants",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class Merchant {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  code: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  })
  walletAddress: string;
}

export type MerchantDocument = Merchant & Document;
export const MerchantSchema = SchemaFactory.createForClass(Merchant);
