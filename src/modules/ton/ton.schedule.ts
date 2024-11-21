import { WalletsService } from "@modules/wallets/wallets.service";
import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { NETWORK } from "@utils/constant/chains";
import env from "@utils/constant/env";
import { sleep } from "@utils/helpers";
import Axios, { AxiosInstance } from "axios";
import { parseUnits } from "ethers";

@Injectable()
export class TonSchedule {
  private client: AxiosInstance;
  private logger = new Logger(TonSchedule.name);
  constructor(private readonly walletsService: WalletsService) {
    this.client = Axios.create({
      baseURL: env.IS_MAINNET
        ? "https://toncenter.com/api"
        : "https://testnet.toncenter.com/api",
    });
  }

  @Interval(1000 * 60 * 5) // every 5 minutes
  async syncBalances(owners?: string[]) {
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await this.client.get("/v3/jetton/wallets", {
          params: {
            jetton_address: env.TON_SMC_ADDRESS.toRawString(),
            limit: limit + 1,
            offset,
            owner_address: owners,
          },
        });
        const wallets = res.data.jetton_wallets;
        hasMore = wallets.length > limit;
        offset += limit;

        for (const wallet of wallets.slice(0, limit)) {
          const balance = Number(wallet.balance) / 10 ** 6;
          const owner = wallet.owner?.toLowerCase();

          const existingWallet = await this.walletsService.findByWalletAddress(
            owner,
          );
          if (existingWallet) {
            existingWallet.balance = balance;
            await existingWallet.save();
          } else {
            await this.walletsService.create({
              walletAddress: owner,
              balance,
              network: NETWORK.TON,
            });
          }

          this.logger.log(`Syncing balance for ${owner}: ${balance}`);
        }

        await sleep(1000);
      } catch (error) {
        this.logger.error("Failed to sync balances", error);
        break;
      }
    }
  }
}
