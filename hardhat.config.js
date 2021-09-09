require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: process.env.MUMBAI_NETWORK,
      accounts: []
    },
    mainnet: {
      url: process.env.MAINNET_NETWORK,
      accounts: []
    }
  },
  solidity: "0.8.4",
};
