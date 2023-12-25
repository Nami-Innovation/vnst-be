import Joi from "joi";

const validationEnv = {
  PORT: Joi.number().default(4000),
  MONGO_URL: Joi.string().required(),
  REDIS_PORT: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  BSC_RPC_HTTP: Joi.string().uri().required(),
  // BSC_RPC_WEBSOCKET: Joi.string().required(),
  ADDRESS_SMART_CONTRACT: Joi.string().required()
};

export default validationEnv;
