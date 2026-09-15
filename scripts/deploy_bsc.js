const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy LegionAI Token
  console.log("\nDeploying LegionAI Token...");
  const LegionAI = await hre.ethers.getContractFactory("LegionAI");
  const token = await LegionAI.deploy(deployer.address); // devWallet = deployer
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ LegionAI Token deployed to:", tokenAddress);

  // 2. Deploy LGAIPresale
  console.log("\nDeploying LGAIPresale...");
  const LGAIPresale = await hre.ethers.getContractFactory("LGAIPresale");
  const presale = await LGAIPresale.deploy(tokenAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ LGAIPresale deployed to:", presaleAddress);

  // 3. Transfer 50% of Total Supply to Presale Contract (500,000,000 LGAI)
  console.log("\nTransferring 500,000,000 LGAI to Presale contract...");
  const amountToTransfer = hre.ethers.parseUnits("500000000", 18);
  const tx = await token.transfer(presaleAddress, amountToTransfer);
  await tx.wait();
  console.log("✅ Tokens successfully transferred to Presale contract.");

  // 4. Save Deployment Info
  const deploymentInfo = {
    network: hre.network.name,
    tokenAddress: tokenAddress,
    presaleAddress: presaleAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  fs.writeFileSync("deployment-bsc.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to deployment-bsc.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
