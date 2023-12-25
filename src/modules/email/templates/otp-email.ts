import { convertWalletToShortString } from "@utils/helpers";

export const OtpTemplate = (wallet: string, otpNumber: string) => {
  return `<div
  style="
    margin-top: 20px;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;
    color: var(--color-vnst-ver-1-black, var(--label-color-lv-1, #000));
  "
>
  Verify your Email
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
  For security reasons, please enter the following OTP within 5 minutes
  and do not share it with anyone.
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
  OTP for Wallet ${convertWalletToShortString(wallet)}:
</div>
<div
  style="
    margin: 20px 0;
    border-radius: 10px;
    background: #f2f4f5;
    padding: 18px 124px;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 100%;
    color: #00c096;
    white-space: nowrap;
  "
>
  ${otpNumber}
</div>
<div
  style="
    margin-top: 20px;
    color: var(--label-color-lv-1, #000);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
  "
>
  This Email is automatically generated. Please do not reply!
</div>`;
};
