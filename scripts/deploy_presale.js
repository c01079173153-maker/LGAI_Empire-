const hre = require("hardhat");

async function main() {
  console.log("🚀 [작전 개시] 100% 자동화 LGAI 프리세일(자판기) 컨트랙트 배포 준비 중...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👨‍✈️ 배포자(사령관) 지갑 주소:", deployer.address);

  const lgaiAddress = "0xC8C2D7B7736C3B5eC4eD0F547791E4389A054512";

  // 1. 프리세일 컨트랙트 배포
  console.log("\n⏳ 1단계: 프리세일 컨트랙트 배포 중...");
  const LGAIPresale = await hre.ethers.getContractFactory("LGAIPresale");
  const presale = await LGAIPresale.deploy(lgaiAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  
  console.log("✅ 프리세일 컨트랙트 배포 완료! 주소:", presaleAddress);

  // 2. 자판기에 LGAI 충전 (퍼블릭 세일 물량 4억 개)
  console.log("\n⏳ 2단계: 자판기(컨트랙트)에 4억 개의 LGAI 충전 중...");
  
  const erc20Abi = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ];
  
  const lgaiContract = new hre.ethers.Contract(lgaiAddress, erc20Abi, deployer);
  
  // 400,000,000 LGAI (decimals 18)
  const fundAmount = hre.ethers.parseUnits("400000000", 18); 
  
  const transferTx = await lgaiContract.transfer(presaleAddress, fundAmount);
  await transferTx.wait();

  const balance = await lgaiContract.balanceOf(presaleAddress);
  console.log(`✅ 자판기 충전 완료! 현재 자판기 잔액: ${hre.ethers.formatUnits(balance, 18)} LGAI`);

  console.log("\n🎉🎉🎉 [프리세일 시스템 구축 대성공] 🎉🎉🎉");
  console.log("이제 프론트엔드(App.jsx)를 이 주소와 연결하십시오:");
  console.log("👉 PRESALE_CONTRACT_ADDRESS:", presaleAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
