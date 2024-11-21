export enum TransactionType {
  MINT = "MINT",
  REDEEM = "REDEEM",
  TRANSFER = "TRANSFER",
}

export type TransactionParsed = {
  type: TransactionType;
  hash: string;
  fromAddress: string;
  toAddress: string;
  payload: Record<string, any>;
  opcode: number;
  timestamp: number; //unix timestamp
  lt: string;
};
