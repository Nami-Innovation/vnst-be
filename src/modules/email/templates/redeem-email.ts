import { NETWORK } from "@utils/constant/chains";
import env from "@utils/constant/env";
import { convertWalletToShortString } from "@utils/helpers";

export const RedeemTemplate = (
  walletAddress: string,
  transactionHash: string,
  network: string = NETWORK.BNB,
) => {
  return `        <div
  style="
    margin-top: 20px;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;
    color: var(--color-vnst-ver-1-black, var(--label-color-lv-1, #000));
  "
>
  Successfully Redeemed
</div>

<div
  style="
    margin-top: 8px;
    color: var(--color-vnst-ver-1-dark-3, #888);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 14px;
  "
>
  Congratulations, you have successfully redeemed VNST from Wallet
  ${convertWalletToShortString(walletAddress)}.
</div>

<div
  style="
    color: var(--color-vnst-ver-1-black, var(--label-color-lv-1, #000));
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 14px;
    margin-top: 30px;
  "
>
  To view the transaction details, please click on TxH:
</div>

<div
  style="
    margin: 12px 0;
    border-radius: 10px;
    background: #eee;
    padding: 12px 16px;
    color: var(--color-vnst-ver-2-d-08900, #00c096);
    text-align: left;
    font-size: 16px;
    font-style: normal;
    line-height: 24px;
    margin-bottom: 6px;
  "
>
  <a
    style="
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    text-align: left;
    color: #00c096;
    display: inline-block;
    height: 24px;
    width: calc(100% - 31px);
    line-height: 35px;
    word-break: break-all;
    "
    href="${
      network === NETWORK.TON ? env.TON_TX_LINK : env.BSC_TX_LINK
    }/${transactionHash}"
  >
    ${transactionHash}
  </a>
</div>

<div
  style="
    margin-top: 12px;
    color: var(--color-vnst-ver-1-black, var(--label-color-lv-1, #000));
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 14px;
  "
>
  If you did not perform this action, please check your Wallet
  activities or review the TxH details.
</div>

<div
  style="
    margin-top: 15px;
    color: var(--label-color-lv-1, #000);
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
  "
>
  This is an automated email from the system, please do not reply!
</div>
  `;
};
