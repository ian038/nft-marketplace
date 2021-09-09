require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: process.env.MUMBAI_NETWORK,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_NETWORK,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.4",
};
