import Axios from "axios";
import env from "@utils/constant/env";
import { GetPriceTokenDto } from "src/type/rest.type";

export const fetcher = Axios.create({ baseURL: env.END_POINT_NAMI });

export const options = {
  headers: {
    "Content-Type": "application/json",
    fakeauthorization: 18,
  },
};
