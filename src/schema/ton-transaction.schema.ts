import { TransactionType } from "@modules/ton/types/transaction";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TonTransactionDocument = TonTransaction & Document;

@Schema({
  collection: "ton_transactions",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class TonTransaction {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  hash: string;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop({
    type: String,
    required: true,
  })
  fromAddress: string;

  @Prop({
    type: String,
    required: true,
  })
  toAddress: string;

  @Prop({
    type: Object,
    required: true,
  })
  payload: Record<string, any>;

  @Prop({
    type: Number,
    required: false,
  })
  opcode?: number;

  @Prop({
    type: Number,
    required: true,
    index: -1,
  })
  timestamp: number;

  @Prop({
    type: String,
    required: true,
  })
  lt: string;
}

export const TonTransactionSchema =
  SchemaFactory.createForClass(TonTransaction);
