import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TransactionLogType = TransactionLog & Document;

@Schema()
export class TransactionLog {
  @Prop({ required: true, unique: true })
  hash: string;

  @Prop({ required: true })
  blockNumber: number;

  @Prop()
  method: string;

  @Prop()
  inputs: [];

  @Prop({ required: true })
  address: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  linkBsc: string;

  @Prop({ required: true })
  timeStamp: number;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const TransactionLogSchema =
  SchemaFactory.createForClass(TransactionLog);
