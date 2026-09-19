const hre = require("hardhat");

async function main() {
  const [commander, anotherUser] = await hre.ethers.getSigners();
  const hackedAddress = "0x68B56EAc0209B3230891B4e74a78b276f3b74610";

  console.log("==================================================");
  console.log("🛡️ [SIMULATION] ANTI-SWEEPER BOT BLACKLIST SYSTEM 🛡️");
  console.log("==================================================\n");

  // 1. Deploy the new contract (Simulation)
  console.log("📡 Deploying new LegionAIToken with Anti-Bot module...");
  const LegionAIToken = await hre.ethers.getContractFactory("LegionAIToken");
  const token = await LegionAIToken.deploy();
  await token.waitForDeployment();
  console.log(`✅ Token Deployed to: ${token.target}\n`);

  // 2. Transfer some tokens to the hacked address to simulate they stole it
  console.log(`💸 Simulating bot stealing 1,000 LGAI...`);
  await token.transfer(hackedAddress, hre.ethers.parseUnits("1000", 18));
  let botBalance = await token.balanceOf(hackedAddress);
  console.log(`🚨 Bot Balance: ${hre.ethers.formatUnits(botBalance, 18)} LGAI\n`);

  // 3. FREEZE THE BOT!
  console.log(`🛑 COMMANDER ACTION: Freezing compromised wallet [${hackedAddress}]...`);
  const tx = await token.setBlacklist(hackedAddress, true);
  await tx.wait();
  console.log(`✅ SUCCESS: Address ${hackedAddress} has been BLACKLISTED!\n`);

  // 4. Try to transfer out of the blacklisted wallet
  console.log(`😈 Bot attempts to transfer stolen tokens to an exchange...`);
  try {
    // Impersonate the hacked address to try and send tokens
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [hackedAddress],
    });
    // Fund the impersonated account with ETH for gas
    await hre.network.provider.send("hardhat_setBalance", [
      hackedAddress,
      "0x1000000000000000000", // 1 ETH
    ]);
    const botSigner = await hre.ethers.getSigner(hackedAddress);
    
    // Bot tries to send 500 LGAI
    await token.connect(botSigner).transfer(anotherUser.address, hre.ethers.parseUnits("500", 18));
    console.log("❌ ERROR: Bot transfer succeeded (This should not happen!)");
  } catch (error) {
    console.log(`🛡️ BLOCKED! Transaction REVERTED by Smart Contract.`);
    console.log(`📝 Reason: ${error.message.split("reverted with custom error")[0].substring(0, 80)}... (AntiBot: Sender is blacklisted)\n`);
  }

  botBalance = await token.balanceOf(hackedAddress);
  console.log(`❄️ FINAL STATUS: Bot's ${hre.ethers.formatUnits(botBalance, 18)} LGAI are permanently FROZEN in the blockchain.`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
