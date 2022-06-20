require("@nomiclabs/hardhat-waffle");

const {API_KEY_MUMBAI, PRIVATE_KEY} = process.env;

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${API_KEY_MUMBAI}`,
      accounts: [PRIVATE_KEY]
    },
  },
  solidity: "0.8.4",
};
