import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, TonClient, Transaction } from "@ton/ton";
import env from "@utils/constant/env";
import { formatTimestamp, retry } from "@utils/helpers";
import { JETTON_OPCODES, VNST_OPCODES } from "./constants/opcodes";
import { formatUnits } from "ethers";
import { USDT_DECIMALS, VNST_DECIMALS } from "./constants/decimals";
import { TransactionParsed, TransactionType } from "./types/transaction";
import { TonService } from "./ton.service";
import { TonSchedule } from "./ton.schedule";
import { EmailService } from "@modules/email/email.service";
import { NotificationService } from "@modules/notification/notification.service";
import { WalletsService } from "@modules/wallets/wallets.service";
import { NotificationType } from "src/schema/notification.schema";
import { NETWORK } from "@utils/constant/chains";

@Injectable()
export class AccountSubscriptionService
  implements OnModuleInit, OnModuleDestroy
{
  private tonClient: TonClient;
  private readonly logger = new Logger(AccountSubscriptionService.name);
  readonly accountAddress: Address = env.TON_SMC_ADDRESS;

  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly tonService: TonService,
    private readonly tonSchedule: TonSchedule,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletsService,
  ) {}

  private lastIndexedLt?: string;

  async onModuleInit() {
    const endpoint = await getHttpEndpoint({
      network: env.IS_MAINNET ? "mainnet" : "testnet",
    });
    this.tonClient = new TonClient({ endpoint });

    try {
      const lastTransaction = await this.tonService.getLastTransaction();
      if (lastTransaction) {
        this.lastIndexedLt = lastTransaction.lt;
      }
    } catch (error) {
      this.logger.error("Failed to get last transaction", error);
    }

    this.intervalId = this.start();
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  parseTransaction(tx: Transaction): TransactionParsed | undefined {
    if (
      tx.inMessage?.info.type !== "internal" ||
      tx.description.type !== "generic" ||
      tx.description.computePhase?.type !== "vm"
    ) {
      return;
    }
    const slice = tx.inMessage.body.beginParse();
    const opcode = slice.loadUint(32);
    const hash = tx.hash().toString("hex");

    const queryId = slice.loadUint(64);

    if (opcode === JETTON_OPCODES.JETTON_NOTIFY) {
      // MINT TRANSACTION
      const jettonAmount = slice.loadCoins();
      const forwadPayload = slice.loadRef().asSlice();
      const fromAddress = slice.loadAddress().toRawString();
      // const toAddress = slice.loadAddress().toRawString();
      const transferedOp = forwadPayload.loadUint(32);
      const timestamp = tx.inMessage.info.createdAt;
      if (transferedOp === VNST_OPCODES.MINT) {
        const outMessage = tx.outMessages.values().find((m) => {
          const slice = m.body.beginParse().clone();
          return slice.loadUint(32) === JETTON_OPCODES.JETTON_TRANSFER_INTERNAL;
        });

        if (!outMessage) {
          this.logger.warn("Invalid Mint: " + hash);
          return;
        }

        const outSlice = outMessage.body.beginParse();
        outSlice.loadUint(32);
        outSlice.loadUint(64);
        const outAmount = outSlice.loadCoins();
        outSlice.loadAddress();
        const toAddress = outSlice.loadAddress().toRawString();
        if (outAmount === jettonAmount) {
          this.logger.warn("Invalid Mint: " + hash);
          console.log(outMessage);

          return;
        }

        return {
          type: TransactionType.MINT,
          hash,
          payload: {
            inAmount: Number(formatUnits(jettonAmount, USDT_DECIMALS)),
            outAmount: Number(formatUnits(outAmount, VNST_DECIMALS)),
            queryId,
          },
          opcode,
          fromAddress,
          toAddress,
          timestamp,
          lt: tx.lt.toString(),
        };
      } else if (transferedOp === VNST_OPCODES.REDEEM) {
        const outMessage = tx.outMessages.values().find((m) => {
          const slice = m.body.beginParse().clone();
          return slice.loadUint(32) === JETTON_OPCODES.JETTON_TRANSFER;
        });

        if (!outMessage) {
          this.logger.warn("Invalid Redeem: " + hash);
          return;
        }

        const outSlice = outMessage.body.beginParse();
        outSlice.loadUint(32);
        outSlice.loadUint(64);
        const outAmount = outSlice.loadCoins();
        outSlice.loadAddress();
        const toAddress = outSlice.loadAddress().toRawString();
        if (outAmount === jettonAmount) {
          this.logger.warn("Invalid Redeem: " + hash);
          return;
        }

        return {
          type: TransactionType.REDEEM,
          hash,
          payload: {
            inAmount: Number(formatUnits(jettonAmount, VNST_DECIMALS)),
            outAmount: Number(formatUnits(outAmount, USDT_DECIMALS)),
            queryId,
          },
          opcode,
          fromAddress,
          toAddress,
          timestamp,
          lt: tx.lt.toString(),
        };
      }
    }
    return;
  }

  private async onTransactions(txs: Transaction[]) {
    for (const tx of txs) {
      try {
        const parsedTxn = this.parseTransaction(tx);
        if (parsedTxn) {
          await this.tonService.createTransaction(parsedTxn);
          await this.tonSchedule.syncBalances([parsedTxn.fromAddress]);

          if (parsedTxn.type === TransactionType.TRANSFER) {
            continue;
          }
          // Send email notification
          const wallet = await this.walletService.findByWalletAddress(
            parsedTxn.fromAddress,
          );

          if (!!wallet) {
            const notiType =
              parsedTxn.type === TransactionType.MINT
                ? NotificationType.MINT
                : NotificationType.REDEEM;
            await this.notificationService.create({
              wallet: wallet._id,
              type: notiType,
              metadata: {
                amountIn: parsedTxn.payload.inAmount,
                amountOut: parsedTxn.payload.outAmount,
                transactionHash: parsedTxn.hash,
                timestamp: parsedTxn.timestamp,
              },
              read: false,
            });
            if (wallet.enabledNoti) {
              await this.emailService.sendEmailTransaction(
                {
                  recipient: wallet?.email,
                  subject: `[VNST] Successfully Minted - ${formatTimestamp(
                    parsedTxn.timestamp,
                  )}`,
                  walletAddress: Address.parse(wallet.walletAddress).toString(),
                  transactionHash: parsedTxn.hash,
                  network: NETWORK.TON,
                },
                notiType,
              );
            }
          }
        }
      } catch (error) {
        this.logger.error("Failed to parse transaction", error);
      }
    }
  }

  /**
   * Get transactions batch (100 transactions). If there is no transactions left returns `hasMore=false` to stop iteration.
   */
  async getTransactionsBatch(toLt?: string, lt?: string, hash?: string) {
    const transactions = await retry(
      () =>
        this.tonClient.getTransactions(this.accountAddress, {
          lt,
          limit: 100,
          hash,
          to_lt: toLt,
          inclusive: false,
          archival: true,
        }),
      { retries: 10, delay: 1000 },
    );

    if (transactions.length === 0) {
      return { hasMore: false, transactions };
    }

    const lastTransaction = transactions.at(-1)!;

    return {
      hasMore: true,
      transactions,
      lt: lastTransaction.lt.toString(),
      hash: lastTransaction.hash().toString("base64"),
    };
  }

  async subscribeToTransactionUpdate(): Promise<void> {
    let iterationStartLt: string = "";
    let hasMore = true;
    let lt: string | undefined;
    let hash: string | undefined;

    // Fetching all the transactions from the end to `this.lastIndexedLt` (or start if undefined).
    while (hasMore) {
      const res = await this.getTransactionsBatch(this.lastIndexedLt, lt, hash);
      hasMore = res.hasMore;
      lt = res.lt;
      hash = res.hash;

      if (res.transactions.length > 0) {
        if (!iterationStartLt) {
          // Stores first fetched transaction lt. At the end of iterations stores in `this.lastIndexedLt` to prevent duplicate transaction fetches
          iterationStartLt = res.transactions[0].lt.toString();
        }

        // cals provided callback
        await this.onTransactions(res.transactions);
      }
    }

    if (iterationStartLt) {
      this.lastIndexedLt = iterationStartLt;
    }
  }

  start(): NodeJS.Timeout {
    let isProcessing = false;
    const tick = async () => {
      // prevent multiple running `subscribeToTransactionUpdate` functions
      if (isProcessing) return;
      isProcessing = true;

      await this.subscribeToTransactionUpdate();

      isProcessing = false;
    };

    // fetch updates every 10 seconds
    const intervalId = setInterval(tick, 10 * 1000);
    tick();

    return intervalId;
  }
}
