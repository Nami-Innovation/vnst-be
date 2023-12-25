import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TokenPriceDocument = TokenPrice & Document;

@Schema({
  collection: "tokenprices",
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class TokenPrice {
  @Prop({
    required: true,
    type: String,
    index: true,
  })
  token: string;

  @Prop({
    required: true,
    type: Number,
  })
  price: number;

  @Prop({
    required: true,
    type: Date,
    index: true,
  })
  time: Date;
}

export const TokenPriceSchema = SchemaFactory.createForClass(TokenPrice);
