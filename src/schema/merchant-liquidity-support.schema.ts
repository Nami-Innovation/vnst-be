import { LIQUIDITY_SUPPORT_TYPE } from "@modules/merchant/merchant.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CHAIN_ID } from "@utils/constant/chains";
import { Merchant } from "./merchant.schema";
import { Types } from "mongoose";
import { Token } from "@utils/constant/common";

@Schema({
  timestamps: true,
  collection: "merchant-liquidity-support",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class LiquiditySupport {
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

  @Prop({
    type: String,
    required: true,
    enum: LIQUIDITY_SUPPORT_TYPE,
  })
  type: LIQUIDITY_SUPPORT_TYPE;
}

export type LiquiditySupportDocument = LiquiditySupport & Document;
export const LiquiditySupportSchema =
  SchemaFactory.createForClass(LiquiditySupport);
