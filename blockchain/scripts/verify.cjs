const hre = require("hardhat");

async function main() {
  console.log("🔍 Starting Smart Contract Verification...");

  // TODO: Replace with real addresses when deployed to Mainnet
  const TOKEN_ADDRESS = "0x880431f3bd33A362F698aD5Be25002623eFCc95c";
  const PRESALE_ADDRESS = "0xD6C3a12C89f2B534526FcaD96d70Cf4F9De25EF2";

  console.log(`Verifying LegionAIToken at ${TOKEN_ADDRESS}...`);
  try {
    await hre.run("verify:verify", {
      address: TOKEN_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ LegionAIToken Verified!");
  } catch (error) {
    console.error("❌ Token Verification Failed:", error.message);
  }

  console.log(`Verifying LegionAIPresale at ${PRESALE_ADDRESS}...`);
  try {
    await hre.run("verify:verify", {
      address: PRESALE_ADDRESS,
      constructorArguments: [TOKEN_ADDRESS], // Note: The Presale constructor takes the token address!
    });
    console.log("✅ LegionAIPresale Verified!");
  } catch (error) {
    console.error("❌ Presale Verification Failed:", error.message);
  }

  console.log("\n============================================");
  console.log("🛡️ VERIFICATION SCRIPT COMPLETED");
  console.log("============================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
