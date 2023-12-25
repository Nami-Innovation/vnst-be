import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Merchant } from "./merchant.schema";
import { CHAIN_ID } from "@utils/constant/chains";
import { Token } from "@utils/constant/token";

@Schema({
  timestamps: true,
  collection: "merchant-contribution-history",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class ContributionHistory {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Merchant.name,
  })
  merchant: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  amount: number;

  @Prop({
    type: String,
    required: true,
    default: Token.VNST,
    enum: Token,
  })
  token: Token;

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
  })
  transactionHash: string;

  @Prop({
    type: Number,
    required: true,
    default: CHAIN_ID.BSC,
    enum: CHAIN_ID,
  })
  chainId: CHAIN_ID;

  createdAt: Date;

  updatedAt: Date;
}

export type ContributionHistoryDocument = ContributionHistory & Document;
export const ContributionHistorySchema =
  SchemaFactory.createForClass(ContributionHistory);
