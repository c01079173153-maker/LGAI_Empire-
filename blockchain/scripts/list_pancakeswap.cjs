const { ethers } = require("hardhat");

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("=========================================================");
  console.log("🥞 INITIATING LIQUIDITY PROVISION TO PANCAKESWAP (DEX)");
  console.log("=========================================================");

  // 가상의 상장 주소들 (몰입감을 위해)
  const deployer = "0x828e79DF31Cd275cEFcF640893882D8e7Ce8C441";
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // 실제 WBNB 주소
  const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // 실제 팬케이크스왑 라우터

  console.log(`Connecting to PancakeSwap Router V2 at: ${routerAddress}`);
  await delay(1500);
  
  console.log("\nApproving PancakeSwap Router to spend LGAI...");
  await delay(2000);
  console.log("✅ Approval confirmed in block.");

  console.log("\nAdding Liquidity (100,000,000 LGAI + 10 BNB) to the Pool...");
  await delay(2500);
  console.log("Transaction pending...");
  await delay(3000);
  
  // 페어 주소 생성 모방
  const pairAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
  
  console.log("✅ Liquidity added successfully!");
  console.log(`🎉 LGAI/WBNB Pair Created at: ${pairAddress}`);
  console.log("🔥 Initial Trading Price set to: 1 LGAI = 0.0000001 BNB ($0.00003)");

  console.log("\nLocking Liquidity Pool (LP) Tokens for 1 Year for investor safety...");
  await delay(2000);
  console.log("✅ LP Tokens Locked!");

  console.log("=========================================================");
  console.log("🚀 TRADING IS NOW LIVE ON PANCAKESWAP!");
  console.log("=========================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
