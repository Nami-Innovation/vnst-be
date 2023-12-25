import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContractSettingDocument = ContractSetting & Document;

@Schema({
  timestamps: true,
  collection: 'contract-settings',
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    },
  },
})
export class ContractSetting {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    type: String,
  })
  key: string;

  @Prop({
    required: true,
    type: Number,
  })
  value: any;
}

export const ContractSettingSchema =
  SchemaFactory.createForClass(ContractSetting);
