const hre = require("hardhat");

async function main() {
  const [commander] = await hre.ethers.getSigners();
  
  // TODO: 여기에 실제 BSC 메인넷에 배포된 LegionAIPresale 컨트랙트 주소를 넣으세요.
  const PRESALE_ADDRESS = "0x..."; 

  console.log("=========================================================");
  console.log("🚀 메인넷 프라이빗 세일 모금액(BNB) 출금 실행");
  console.log("=========================================================");

  if (PRESALE_ADDRESS === "0x...") {
    console.error("❌ 오류: PRESALE_ADDRESS 변수에 실제 프라이빗 세일 컨트랙트 주소를 입력해야 합니다!");
    process.exit(1);
  }

  const presale = await hre.ethers.getContractAt("LegionAIPresale", PRESALE_ADDRESS);

  const presaleBalance = await hre.ethers.provider.getBalance(PRESALE_ADDRESS);
  console.log(`현재 금고(Treasury) 잔액: ${hre.ethers.formatEther(presaleBalance)} BNB`);

  if (presaleBalance === 0n) {
    console.log("출금할 잔액이 없습니다.");
    return;
  }

  console.log("\n[사령관] 출금을 요청합니다...");
  // 사령관 본인(owner)만이 withdrawFunds()를 실행할 수 있습니다.
  const tx = await presale.connect(commander).withdrawFunds();
  console.log(`트랜잭션 전송됨! 해시: ${tx.hash}`);
  
  await tx.wait();
  
  const finalCommanderBalance = await hre.ethers.provider.getBalance(commander.address);
  console.log("✅ 금고의 모든 BNB가 사령관 지갑으로 안전하게 입금되었습니다!");
  console.log(`✅ 현재 사령관 지갑 총 잔액: ${hre.ethers.formatEther(finalCommanderBalance)} BNB`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
