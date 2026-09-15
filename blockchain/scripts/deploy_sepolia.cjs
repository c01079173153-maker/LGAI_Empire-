const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🚀 Starting LGAI Sepolia Deployment...");

  const COMMANDER_WALLET = "0x68B56EAc0209B3230891B4e74a78b276f3b74610";

  // 1. Deploy Token
  console.log("Deploying LegionAIToken...");
  const Token = await ethers.getContractFactory("LegionAIToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ LegionAIToken deployed to: ${tokenAddress}`);

  // 2. Deploy Presale Treasury
  console.log("Deploying LegionAIPresale...");
  const Presale = await ethers.getContractFactory("LegionAIPresale");
  const presale = await Presale.deploy(tokenAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log(`✅ LegionAIPresale deployed to: ${presaleAddress}`);

  // 3. Transfer 1 Billion Tokens to Commander
  console.log(`Transferring 1 Billion LGAI to Commander (${COMMANDER_WALLET})...`);
  const totalSupply = await token.totalSupply();
  const tx1 = await token.transfer(COMMANDER_WALLET, totalSupply);
  await tx1.wait();
  console.log("✅ 1 Billion LGAI Transferred.");

  // 4. Transfer Ownership of Token to Commander
  console.log("Transferring Token Ownership to Commander...");
  const tx2 = await token.transferOwnership(COMMANDER_WALLET);
  await tx2.wait();
  console.log("✅ Token Ownership Transferred.");

  // 5. Transfer Ownership of Presale to Commander
  console.log("Transferring Presale Ownership to Commander...");
  const tx3 = await presale.transferOwnership(COMMANDER_WALLET);
  await tx3.wait();
  console.log("✅ Presale Ownership Transferred.");

  console.log("\n============================================");
  console.log("🎉 ALL DEPLOYMENT & TRANSFERS COMPLETED 🎉");
  console.log("============================================");
  console.log("Token Address:   ", tokenAddress);
  console.log("Presale Address: ", presaleAddress);
  console.log("Commander Wallet:", COMMANDER_WALLET);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
