import Axios from "axios";
import env from "@utils/constant/env";
import { GetPriceTokenDto } from "src/type/rest.type";

export const END_POINT_BINANCE = "https://api.binance.com/api/v3";

export const fetcher = Axios.create({ baseURL: env.END_POINT_NAMI });

export const fetchBinance = Axios.create({ baseURL: END_POINT_BINANCE });

export const options = {
  headers: {
    "Content-Type": "application/json",
    fakeauthorization: 18,
  },
};

export const fetchPrice = async (props: GetPriceTokenDto) => {
  const { symbol } = props;

  const { data } = await fetcher.get(
    `/api/v3/spot/market_watch?symbol=${symbol}`,
  );

  return data;
};

export const fetchPriceFutureNami = async (symbol: string) => {
  // fetch current price
  const { data } = await fetcher.get(`/api/v3/futures/ticker`, {
    headers: { "Accept-Encoding": "gzip,deflate,compress" },
    params: { symbol: symbol.toUpperCase() },
  });

  console.log(
    "_____ func fetchPriceFutureNami from nami for symbol ",
    symbol,
    " - data: ",
    data,
  );

  return data.data && data.data[0] && data.data[0].price;
};
