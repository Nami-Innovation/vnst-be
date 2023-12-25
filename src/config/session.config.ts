import session from "express-session";
import Redis from "ioredis";
import ConnectRedis from "connect-redis";
import { LoggerService } from "@modules/logger/logger.service";
import env from "@utils/constant/env";

const redisClient = new Redis({
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  host: env.REDIS_HOST,
});

redisClient.on("error", (err: Error) => {
  return LoggerService.log(
    `Could not establish a connection with redis. ${err}`,
  );
});

redisClient.on("ready", () => {
  LoggerService.log(`Connect redis successfully`);
});

const sessionConfig = session({
  name: "userId",
  store: new ConnectRedis({ client: redisClient }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 6, // 6 hour
    httpOnly: true, // JS front end cannot access the cookie
    secure: env.NODE_ENV === "production", // process.env.NODE_ENV === 'production' cookie only works in https
    sameSite: "lax",
  },
  secret: env.JWT_SECRET_KEY,
  saveUninitialized: false, // don't save empty sessions, right from the start
  resave: true,
});

export default sessionConfig;
