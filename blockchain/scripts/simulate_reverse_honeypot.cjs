const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("=====================================================");
    console.log("🪤 [리버스 허니팟 시뮬레이션] 해커 역공 덫 가동 시작");
    console.log("=====================================================\n");

    const [deployer, hacker] = await ethers.getSigners();
    
    // 사령관님이 방금 만들어주신 가짜 계정 (안전한 수신 지갑)
    const trueCommanderWallet = "0x75e588eEe61967b7802b4396e2fCc193D8C710Cd";

    console.log(`[사령관 덫 수금용 가짜 지갑]: ${trueCommanderWallet}`);
    console.log(`[해커 지갑]: ${hacker.address}\n`);

    // 1. 역공 덫(VulnerableVault) 배포
    console.log("⏳ [1단계] 사령관님이 블록체인에 위장 금고(덫)를 설치합니다...");
    const VaultFactory = await ethers.getContractFactory("VulnerableVault");
    
    // 덫을 배포할 때, 사령관님의 가짜 수금용 지갑 주소를 백도어에 몰래 심어둡니다.
    const vault = await VaultFactory.deploy(trueCommanderWallet);
    await vault.waitForDeployment();
    console.log(`✅ 위장 금고(VulnerableVault) 설치 완료: ${vault.target}\n`);

    // 2. 사령관 수금용 지갑의 잔고 확인 (시작 전)
    let commanderBalanceBefore = await ethers.provider.getBalance(trueCommanderWallet);
    let hackerBalanceBefore = await ethers.provider.getBalance(hacker.address);

    console.log(`💰 [덫 작동 전] 해커 지갑 잔액: ${ethers.formatEther(hackerBalanceBefore)} BNB`);
    console.log(`💰 [덫 작동 전] 사령관 가짜 지갑 잔액: ${ethers.formatEther(commanderBalanceBefore)} BNB\n`);

    // 3. 해커 봇이 함정을 뭅니다.
    console.log(`🚨 [2단계] 해커 봇이 깃허브에서 위장 금고를 발견했습니다!`);
    console.log(`🤖 해커 봇: "오케이 100 BNB 발견! 수수료 0.05 BNB 쏘고 훔쳐야지 ㅋㅋㅋ"`);
    console.log(`💸 해커가 0.05 BNB를 금고로 송금하며 'claimVault()'를 호출합니다...\n`);

    // 해커가 금고를 털기 위해 0.05 BNB를 보냄
    const hackerConnectedVault = vault.connect(hacker);
    
    try {
        const tx = await hackerConnectedVault.claimVault({ value: ethers.parseEther("0.05") });
        await tx.wait();
        console.log(`✅ [트랜잭션 승인됨] 해커는 자기가 돈을 훔친 줄 압니다...`);
    } catch (e) {
        console.log("에러:", e.message);
    }

    console.log("\n=====================================================");
    console.log("🔥 [결과 확인] 리버스 허니팟 발동 후 잔액 변동");
    console.log("=====================================================\n");

    let commanderBalanceAfter = await ethers.provider.getBalance(trueCommanderWallet);
    let hackerBalanceAfter = await ethers.provider.getBalance(hacker.address);

    console.log(`💀 [덫 작동 후] 해커 지갑 잔액: ${ethers.formatEther(hackerBalanceAfter)} BNB (가스비 포함 약 0.05 BNB 감소)`);
    console.log(`💰 [덫 작동 후] 사령관 가짜 지갑 잔액: ${ethers.formatEther(commanderBalanceAfter)} BNB (해커의 0.05 BNB 완벽 흡수!)\n`);

    console.log(`🎯 [작전 대성공] 해커의 봇이 수수료를 뜯기며 완벽하게 농락당했습니다!`);
}

main().catch(console.error);
