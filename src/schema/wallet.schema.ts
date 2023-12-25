import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WalletDocument = Wallet & Document;

@Schema({
  timestamps: true,
  collection: "wallets",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class Wallet {
  @Prop({
    trim: true,
    lowercase: true,
    type: String,
  })
  email?: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
    index: true,
  })
  walletAddress: string;

  @Prop({
    required: true,
    type: Boolean,
    default: false,
  })
  enabledNoti: boolean;

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  balance: number;

  @Prop({
    required: false,
    type: String,
  })
  nonce?: string;

  @Prop({
    required: false,
    type: String,
  })
  otp?: string;

  @Prop({
    required: false,
    type: Number,
  })
  otpCreatedTime?: number;

  @Prop({
    trim: true,
    lowercase: true,
    required: false,
    type: String,
  })
  tmpEmail?: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
