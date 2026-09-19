const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=========================================================");
  console.log("🚀 INITIATING DEPLOYMENT TO BNB SMART CHAIN (BSC) MAINNET");
  console.log("=========================================================");
  console.log("Deployer Address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer BNB Balance:", ethers.formatEther(balance));

  // 1. Deploy LGAI Token
  console.log("\nDeploying LegionAIToken...");
  const Token = await ethers.getContractFactory("LegionAIToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ LegionAIToken deployed to:", tokenAddress);

  // 2. Deploy Presale Treasury
  console.log("\nDeploying LegionAIPresale...");
  const Presale = await ethers.getContractFactory("LegionAIPresale");
  const presale = await Presale.deploy(tokenAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ LegionAIPresale deployed to:", presaleAddress);

  // 3. Transfer 40% (400,000,000 LGAI) to Presale Contract
  console.log("\nTransferring 400M LGAI to Presale Treasury...");
  const transferAmount = ethers.parseUnits("400000000", 18);
  const tx1 = await token.transfer(presaleAddress, transferAmount);
  await tx1.wait();
  console.log("✅ Transferred 400M LGAI to Presale Contract.");

  // 4. Transfer Token Ownership to Presale Contract (so Presale can bypass 0.5% tax)
  console.log("\nTransferring Token Ownership to Presale Contract...");
  const tx2 = await token.transferOwnership(presaleAddress);
  await tx2.wait();
  console.log("✅ Token Ownership Transferred.");

  // 5. Transfer Presale Contract Ownership to Commander Wallet
  const COMMANDER_WALLET = "0x68B56EAc0209B3230891B4e74a78b276f3b74610";
  console.log(`\nTransferring Presale Ownership to Commander (${COMMANDER_WALLET})...`);
  const tx3 = await presale.transferOwnership(COMMANDER_WALLET);
  await tx3.wait();
  console.log("✅ Presale Ownership Transferred to Commander.");

  console.log("\n=========================================================");
  console.log("🎉 BSC MAINNET DEPLOYMENT COMPLETE!");
  console.log(`Token Address:   ${tokenAddress}`);
  console.log(`Presale Address: ${presaleAddress}`);
  console.log("=========================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
