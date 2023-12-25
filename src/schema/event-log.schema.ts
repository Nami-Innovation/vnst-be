import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CHAIN_ID } from "@utils/constant/chains";
import { Document } from "mongoose";

export type EventLogDocument = EventLog & Document;

@Schema({
  timestamps: true,
  collection: "event-logs",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class EventLog {
  @Prop({
    required: true,
    type: String,
    index: true,
  })
  event: string;

  @Prop({
    required: true,
    type: String,
    index: true,
  })
  address: string;

  @Prop({
    type: Array,
  })
  topics: string[];

  @Prop({
    type: String,
    required: true,
  })
  data: string;

  @Prop({
    type: Number,
  })
  blockNumber?: number;

  @Prop({
    type: String,
  })
  transactionHash?: string;

  @Prop({
    type: Number,
  })
  transactionIndex?: number;

  @Prop({
    type: String,
  })
  blockHash?: string;

  @Prop({
    type: Number,
  })
  logIndex?: number;

  @Prop({
    type: Object,
  })
  raw?: {
    data: string;
    topics: unknown[];
  };

  @Prop({
    type: Object,
    required: true,
  })
  returnValues: Record<string, unknown>;

  @Prop({
    type: String,
  })
  signature?: string;

  @Prop({
    type: Number,
    required: true
  })
  chainId: CHAIN_ID
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

EventLogSchema.index(
  { blockHash: 1, transactionHash: 1, logIndex: 1, chainId: 1 },
  { unique: true },
);
