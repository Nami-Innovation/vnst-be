module.exports = {
  apps: [
    {
      name: "vnsc-be",
      script: "yarn start",
      max_memory_restart: "2G",
      // env: {
      //   NODE_ENV: "production",
      // },
    },
  ],
};
