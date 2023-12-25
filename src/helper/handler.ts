import crypto from "crypto";

export const diffStopfutures = 0; // 0%

export const diffClaim = 0.05; // 5%

export const formatPriceToWeiValue = (_num: number): bigint => {
  return BigInt(_num * 10 ** 18);
};

export const randomNonce = (): number => {
  return Math.floor(Math.random() * 899999 + 100000);
};

export const convertDateToTimeStamp = (_date: number, _time_plus = 0) => {
  const parseDate = new Date(_date * 1000);

  parseDate.setMinutes(parseDate.getMinutes() + _time_plus);

  return new Date(parseDate).getTime() / 1000;
};

export const getDateMonthYear = (_date: Date): string => {
  const date = _date.getDate() > 10 ? _date.getDate() : "0" + _date.getDate();

  const month =
    _date.getMonth() > 10 ? _date.getMonth() + 1 : "0" + (_date.getMonth() + 1);

  const year = _date.getFullYear().toString();

  const getLast2NumberOfYear = year.slice(year.length - 2, year.length);

  return getLast2NumberOfYear + date + month;
};

export const convertTimeStampToDate = (timestamp: number) => {
  const expired = new Date(timestamp);

  const parse_expired =
    expired.getDate() +
    " - " +
    (expired.getMonth() + 1) +
    " - " +
    expired.getFullYear();

  return parse_expired;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};