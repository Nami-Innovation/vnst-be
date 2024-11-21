import { getErrorMessage } from "@config/exception.config";
import { ContractService } from "@modules/contract/contract.service";
import { NotificationService } from "@modules/notification/notification.service";
import { WalletsService } from "@modules/wallets/wallets.service";
import { Processor, Process } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DECIMALS } from "@utils/constant/common";
import { Job } from "bull";
import { isEthereumAddress } from "class-validator";
import { Model } from "mongoose";
import { EventLog, EventLogDocument } from "src/schema/event-log.schema";
import { NotificationType } from "src/schema/notification.schema";
import { EventName } from "./event-logs.constant";
import { EmailService } from "@modules/email/email.service";
import { formatTimestamp } from "@utils/helpers";
import { NETWORK } from "@utils/constant/chains";

@Processor("eventLog")
export class EventLogsConsumer {
  private readonly logger = new Logger(EventLogsConsumer.name);

  constructor(
    private readonly walletsService: WalletsService,
    private readonly contractService: ContractService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLogDocument>,
  ) {}

  @Process({
    name: "updateBalance",
    concurrency: 1,
  })
  async updateBalance(job: Job<string>) {
    const address = job.data.toLowerCase().trim();

    if (address === "0x0000000000000000000000000000000000000000") return;
    try {
      const balance = await this.contractService.getBalanceOf(address);
      const wallet = await this.walletsService.findByWalletAddress(address);
      if (wallet) {
        wallet.balance = balance;
        wallet.isNew = false;
        await wallet.save();
      } else {
        await this.walletsService.create({
          walletAddress: address,
          balance,
          network: NETWORK.BNB,
        });
      }
    } catch (error) {
      this.logger.error(`updateBalance (${address}) failed: ` + error.message);
    }
  }

  @Process({
    name: "insertEventLog",
    concurrency: 5,
  })
  async insertEventLog(job: Job<EventLog>) {
    const eventLog = job.data;
    const log = await this.eventLogModel.updateOne(
      {
        blockHash: eventLog.blockHash,
        transactionHash: eventLog.transactionHash,
        logIndex: eventLog.logIndex,
        chainId: eventLog.chainId,
      },
      {
        $set: eventLog,
      },
      { upsert: true },
    );

    // Insert notification mỗi khi có event thuộc NotificationEvents
    const NotificationEvents = [EventName.MINT, EventName.REDEEM];
    if (
      log.upsertedId &&
      NotificationEvents.includes(eventLog.event as EventName)
    ) {
      const address = (eventLog.returnValues[0] as string).toLowerCase();

      if (address && isEthereumAddress(address)) {
        try {
          const wallet = await this.walletsService.findByWalletAddress(
            address as string,
          );
          if (wallet) {
            const amountIn = Number(eventLog.returnValues[1]) / DECIMALS;
            const amountOut = Number(eventLog.returnValues[2]) / DECIMALS;
            const transactionHash = eventLog.transactionHash;
            const timestamp = Number(eventLog.returnValues.created_at);
            switch (eventLog.event) {
              case EventName.MINT:
                await this.notificationService.create({
                  wallet: wallet._id,
                  metadata: {
                    amountIn,
                    amountOut,
                    transactionHash,
                    timestamp,
                  },
                  type: NotificationType.MINT,
                  read: false,
                });
                // Code send email for mint & redeem success
                if (wallet?.enabledNoti === true) {
                  await this.emailService.sendEmailTransaction(
                    {
                      recipient: wallet?.email,
                      subject: `[VNST] Successfully Minted - ${formatTimestamp(
                        timestamp,
                      )}`,
                      walletAddress: wallet.walletAddress,
                      transactionHash,
                      network: NETWORK.BNB,
                    },
                    NotificationType.MINT,
                  );
                }
                break;
              case EventName.REDEEM:
                await this.notificationService.create({
                  wallet: wallet._id,
                  metadata: {
                    amountIn,
                    amountOut,
                    transactionHash,
                    timestamp,
                  },
                  type: NotificationType.REDEEM,
                  read: false,
                });
                //Code send email for mint & redeem success
                if (wallet?.enabledNoti === true) {
                  await this.emailService.sendEmailTransaction(
                    {
                      recipient: wallet?.email,
                      subject: `[VNST] Successfully Redeemed - ${formatTimestamp(
                        timestamp,
                      )}`,
                      walletAddress: wallet.walletAddress,
                      transactionHash,
                      network: NETWORK.BNB,
                    },
                    NotificationType.REDEEM,
                  );
                }
                break;
              default:
                break;
            }
          }
        } catch (error) {
          this.logger.warn(
            `Insert notification failed| Error: '${getErrorMessage(error)}'`,
          );
        }
      } else {
        this.logger.warn(
          `Insert notification failed| Invalid address: '${address}'`,
        );
      }
    }
  }
}
