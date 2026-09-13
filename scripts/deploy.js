const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 ═══════════════════════════════════════════════");
  console.log("   Legion AI (LGAI) 토큰 배포 시작...");
  console.log("   네트워크:", hre.network.name);
  console.log("═══════════════════════════════════════════════════\n");

  // 배포자 정보
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("📋 배포자 주소:", deployer.address);
  console.log("💰 잔액:", hre.ethers.formatEther(balance), "ETH\n");

  // devWallet 주소 설정 (배포자 주소를 기본으로 사용)
  const devWallet = process.env.DEV_WALLET || deployer.address;
  console.log("🏦 DevWallet (세금 수령 지갑):", devWallet);

  // 컨트랙트 배포
  console.log("\n⏳ 스마트 컨트랙트 컴파일 및 배포 중...\n");
  
  const LegionAI = await hre.ethers.getContractFactory("LegionAI");
  const legionAI = await LegionAI.deploy(devWallet);
  
  await legionAI.waitForDeployment();
  
  const contractAddress = await legionAI.getAddress();
  
  console.log("═══════════════════════════════════════════════════");
  console.log("✅ Legion AI (LGAI) 배포 성공!");
  console.log("═══════════════════════════════════════════════════");
  console.log("📄 컨트랙트 주소:", contractAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("🪙 토큰 이름: Legion AI (LGAI)");
  console.log("📊 총 발행량: 1,000,000,000 LGAI");
  console.log("💸 세금: 4% (유동성 2% + 개발 2%)");
  console.log("═══════════════════════════════════════════════════\n");

  // 배포 정보 저장
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    devWallet: devWallet,
    deployedAt: new Date().toISOString(),
    tokenName: "Legion AI",
    tokenSymbol: "LGAI",
    totalSupply: "1,000,000,000",
    taxRate: "4%",
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 배포 정보가 deployment-info.json에 저장되었습니다.\n");

  // 메타마스크에 토큰 추가 안내
  console.log("═══════════════════════════════════════════════════");
  console.log("📱 메타마스크에서 LGAI 토큰 추가 방법:");
  console.log("═══════════════════════════════════════════════════");
  console.log("1. 메타마스크 열기 > Sepolia 테스트넷 선택");
  console.log("2. '토큰 가져오기(Import Tokens)' 클릭");
  console.log("3. 토큰 계약 주소:", contractAddress);
  console.log("4. 토큰 기호: LGAI");
  console.log("5. 소수 자릿수: 18");
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });
