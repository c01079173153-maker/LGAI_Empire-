require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// 보안 철칙: .env 파일에만 실제 키를 보관하며 깃허브에 올리지 않습니다.
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [PRIVATE_KEY]
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: [PRIVATE_KEY] // .env에서 안전하게 불러옵니다
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
