const hre = require("hardhat");

async function main() {
  const [commander, buyer] = await hre.ethers.getSigners();

  console.log("=========================================================");
  console.log("🚀 시뮬레이션: 프라이빗 세일 모금액(BNB) 출금 테스트");
  console.log("=========================================================");

  // 1. 컨트랙트 배포 (토큰 및 프리스세일)
  const Token = await hre.ethers.getContractFactory("LegionAIToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const Presale = await hre.ethers.getContractFactory("LegionAIPresale");
  const presale = await Presale.deploy(tokenAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  // 2. 초기 설정 (토큰 전송 및 권한 이전)
  await token.transfer(presaleAddress, hre.ethers.parseUnits("400000000", 18));
  await token.transferOwnership(presaleAddress);

  // 3. 투자자가 BNB로 토큰 구매
  console.log("\n[투자자] 10 BNB로 LGAI 토큰 구매 중...");
  const buyAmount = hre.ethers.parseEther("10"); // 10 BNB
  await presale.connect(buyer).buyTokens({ value: buyAmount });

  const presaleBalance = await hre.ethers.provider.getBalance(presaleAddress);
  console.log(`✅ 프리스세일 금고 누적 금액: ${hre.ethers.formatEther(presaleBalance)} BNB`);

  // 4. 사령관이 출금
  console.log("\n[사령관] 금고(Treasury)에서 BNB 출금 시작...");
  const initialCommanderBalance = await hre.ethers.provider.getBalance(commander.address);
  
  const tx = await presale.connect(commander).withdrawFunds();
  const receipt = await tx.wait();
  
  // 가스비 계산
  const gasUsed = receipt.gasUsed * receipt.gasPrice;

  const finalCommanderBalance = await hre.ethers.provider.getBalance(commander.address);
  const withdrawnAmount = finalCommanderBalance - initialCommanderBalance + gasUsed;

  console.log(`✅ 출금된 금액: ${hre.ethers.formatEther(withdrawnAmount)} BNB`);
  console.log(`✅ 출금 후 사령관 지갑 총 잔액: ${hre.ethers.formatEther(finalCommanderBalance)} BNB`);
  console.log("=========================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
