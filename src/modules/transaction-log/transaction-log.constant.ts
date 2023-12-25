import env from "@utils/constant/env";

export const AXIOS_TIME_OUT = 10000;

export const TRANSACTION_TYPE = {
  MINT: "mint",
  BURN: "burn",
  TRANSFER: "transfer",
};

export const PARAM_GET_TRANSACTION = {
  module: "account",
  action: "txlist",
  address: env.ADDRESS_SMART_CONTRACT,
  //API_KEY_BSC=G5Q93SDSE8J9HJZBUGQC3IY3H837C2QA6K
  apiKey: env.API_KEY_BSC,
  sort: "desc",
};

export const LINK_BSC = (hash: string) => {
  return `https://testnet.bscscan.com/tx/${hash}`;
};

export const JOB_TIME = "5 * * * * *";
