import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserType = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  nonce: number;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  ref: string;

  @Prop({ type: String, unique: true })
  myRef: string;

  @Prop({ type: Number, default: 0 })
  totalMargin?: number;

  @Prop({ type: Number, default: 0 })
  totalMarginChildren?: number;

  @Prop({ type: Number, default: 0 })
  commissionAvailable?: number;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
