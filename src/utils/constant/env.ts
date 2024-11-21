import { Address } from "@ton/core";
import * as dotenv from "dotenv";
dotenv.config();

const env: { [key: string]: any } = {};

define("NODE_ENV", process.env.NODE_ENV);
define("MONGO_URL", process.env.MONGO_URL);
define("PORT", process.env.PORT);
define("isProduction", process.env.NODE_ENV === "production");
define("JWT_SECRET_KEY", process.env.JWT_SECRET_KEY);
define(
  "REDIS_PORT",
  process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
);
define("REDIS_HOST", process.env.REDIS_HOST);
define("REDIS_PASSWORD", process.env.REDIS_PASSWORD);
define("REDIS_USER_NAME", process.env.REDIS_USER_NAME);
define("END_POINT_NAMI", process.env.END_POINT_NAMI);
define("MAILGUN_API_KEY", process.env.MAILGUN_API_KEY);
define("MAILGUN_DOMAIN", process.env.MAILGUN_DOMAIN);
define("EMAIL_FROM", process.env.EMAIL_FROM);
define("API_KEY_BSC", process.env.API_KEY_BSC);
define("ADDRESS_SMART_CONTRACT", process.env.ADDRESS_SMART_CONTRACT);
define("BSC_TX_LINK", process.env.BSC_TX_LINK);
define("TON_TX_LINK", process.env.TON_TX_LINK);
define("IS_MAINNET", process.env.IS_MAINNET === "true");
// TON CONFIG
define("TON_SMC_ADDRESS", Address.parse(process.env.TON_SMC_ADDRESS));

function define(key: string, value: any) {
  Object.defineProperty(env, key, {
    value,
    enumerable: true,
  });
}

export default env;
