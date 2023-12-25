import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Merchant, MerchantDocument } from "src/schema/merchant.schema";

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(Merchant.name)
    private merchantModel: Model<MerchantDocument>,
  ) {}

  findByCode(code: string) {
    return this.merchantModel.findOne({ code });
  }

  findById(id: string) {
    return this.merchantModel.findById(id);
  }
}
