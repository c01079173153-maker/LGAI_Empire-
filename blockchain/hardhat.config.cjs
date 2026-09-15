require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: ["0x2c4223c3c9e0dec6c5a716f25da215cb8eda2a3a334b373f7dd046e6ed747430"]
    }
  },
  etherscan: {
    // TODO: Replace with real API keys when deploying to Mainnet
    apiKey: {
      sepolia: "YOUR_ETHERSCAN_API_KEY",
      bsc: "YOUR_BSCSCAN_API_KEY"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
