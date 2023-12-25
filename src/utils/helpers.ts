import dayjs from "./dayjs";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function addCommas(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getDecimalPlaces(number: number, decimal = 4): string {
  const roundedNumber = number.toFixed(decimal);
  const parts = roundedNumber.split(".");
  parts[0] = addCommas(parts[0]);
  return parts.join(".");
}

export function formatTimestamp(timestamp: number): string {
  const date = dayjs.unix(timestamp);
  const formattedDate = date.utc().format("DD.MM.YYYY (UTC)");
  return formattedDate;
}

export function formatMarketPrice(number) {
  return getDecimalPlaces(number / 1e6, 0);
}

export function convertWalletToShortString(str: string) {
  const prefix = str.slice(0, 6);
  const suffix = str.slice(-4);
  return `${prefix}...${suffix}`;
}
