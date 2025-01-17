import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateWalletDto } from "./dto/create-wallet.dto";
import { UpdateEmailDto, UpdateWalletDto } from "./dto/update-wallet.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Wallet, WalletDocument } from "src/schema/wallet.schema";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EmailService } from "@modules/email/email.service";
import dayjs from "src/utils/dayjs";
import { formatTimestamp } from "@utils/helpers";
import { ContractService } from "@modules/contract/contract.service";
import { CacheService } from "@modules/cache/cache.service";
import { NETWORK } from "@utils/constant/chains";

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectQueue("eventLog") private readonly eventLogQueue: Queue,
    private readonly emailService: EmailService,
    private readonly contractService: ContractService,
    private readonly cacheService: CacheService,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return this.walletModel.create({
      walletAddress: createWalletDto.walletAddress,
      email: createWalletDto.email,
      enabledNoti: createWalletDto.enabledNoti,
      balance: createWalletDto.balance,
      nonce: createWalletDto.nonce,
      network: createWalletDto.network,
    });
  }

  async countHolders(network: NETWORK) {
    return this.walletModel.count({ balance: { $gt: 0 }, network });
  }

  findOne(id: string) {
    return this.walletModel.findById(id);
  }

  findByEmail(email: string) {
    return this.walletModel.findOne({ email });
  }

  findByWalletAddress(walletAddress: string) {
    return this.walletModel.findOne({ walletAddress });
  }

  async getWalletDetail(walletAddress: string, network: NETWORK) {
    const cacheKey = `vnst-cms:${walletAddress}`;
    let isVerified = await this.cacheService.get(cacheKey);
    // TODO: Check if wallet is verified on TON
    if (isVerified === null && network === NETWORK.BNB) {
      try {
        isVerified = await this.contractService.isVerified(walletAddress);
        this.cacheService.set(cacheKey, isVerified, 300);
      } catch (error) {
        isVerified = false;
      }
    }

    const data = await this.walletModel.findOne({ walletAddress, network });
    if (!data) {
      return null;
    }

    return {
      ...data.toObject(),
      isVerified: isVerified || false,
    };
  }

  async update(walletAddress: string, updateWalletDto: UpdateWalletDto) {
    const wallet = await this.findByWalletAddress(walletAddress);
    if (!wallet) return null;

    if (updateWalletDto.hasOwnProperty("enabledNoti")) {
      wallet.enabledNoti = updateWalletDto.enabledNoti;
    }
    return wallet.save();
  }

  async getNonce(walletAddress: string) {
    const nonce = uuidv4();
    await this.walletModel.findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          nonce,
          network: NETWORK.BNB,
        },
      },
      { upsert: true },
    );
    return nonce;
  }

  async scanBalance() {
    const wallets = await this.walletModel.find();
    await this.eventLogQueue.addBulk(
      wallets.map((wallet) => ({
        name: "updateBalance",
        data: wallet.walletAddress,
      })),
    );
    return {
      status: "ok",
    };
  }

  async verifyEmail(wallet: WalletDocument, email: string) {
    const otp = this.generateOtp(6);
    wallet.otp = otp;
    wallet.otpCreatedTime = Date.now();
    wallet.tmpEmail = email;
    await wallet.save();
    const timestamp = dayjs().unix().valueOf();
    await this.emailService.sendEmailOtp({
      subject: `[VNST] Email Verification Code  - ${formatTimestamp(
        timestamp,
      )}`,
      otp: otp,
      recipient: email,
      walletAddress: wallet.walletAddress,
    });
  }

  updateEmail(wallet: WalletDocument, data: UpdateEmailDto) {
    if (data.email !== wallet.tmpEmail) {
      throw new BadRequestException("Please verify your email first");
    }

    if (!this.validateOtp(wallet, data.otp)) {
      throw new BadRequestException("OTP is invalid");
    }

    wallet.otp = undefined;
    wallet.otpCreatedTime = undefined;
    wallet.email = wallet.tmpEmail;
    wallet.tmpEmail = undefined;

    return wallet.save();
  }

  validateOtp(wallet: WalletDocument, otp: string) {
    const currentTime = Date.now();

    if (
      !!wallet.otp &&
      !!wallet.otpCreatedTime &&
      otp === wallet.otp &&
      currentTime - wallet.otpCreatedTime <= 5 * 60 * 1000 //5p
    ) {
      return true;
    }
    return false;
  }

  generateOtp(limit: number) {
    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < limit; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
}
