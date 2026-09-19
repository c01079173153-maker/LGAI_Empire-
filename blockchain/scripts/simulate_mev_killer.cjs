const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("==================================================================");
    console.log("🕸️  [살모넬라 작전] MEV 봇 킬러 시뮬레이션 개시");
    console.log("==================================================================\n");

    const [deployer, botOwner] = await ethers.getSigners();
    const commanderFakeWallet = "0x75e588eEe61967b7802b4396e2fCc193D8C710Cd";

    console.log(`🛡️ [사령관님 가짜 수금용 지갑]: ${commanderFakeWallet}`);
    console.log(`🤖 [해커(봇 주인) 지갑]: ${botOwner.address}\n`);

    // 1. 함정 배포
    console.log("⏳ [1단계] 사령관님이 봇 킬러 함정(MevKillerTrap)을 블록체인에 매설합니다...");
    const TrapFactory = await ethers.getContractFactory("MevKillerTrap");
    const trap = await TrapFactory.deploy(commanderFakeWallet, { value: ethers.parseEther("0.1") });
    await trap.waitForDeployment();
    console.log(`✅ 함정 매설 완료: ${trap.target} (미끼 0.1 BNB 장전)\n`);

    // 2. 해커 봇 배포
    console.log("⏳ [2단계] 해커가 자동화된 차익거래 봇(FakeMevBot) 컨트랙트를 돌리고 있습니다...");
    const BotFactory = await ethers.getContractFactory("FakeMevBot");
    const bot = await BotFactory.connect(botOwner).deploy();
    await bot.waitForDeployment();
    console.log(`✅ 해커 봇 가동 중: ${bot.target}\n`);

    // 잔액 확인 (전)
    let commanderBalanceBefore = await ethers.provider.getBalance(commanderFakeWallet);
    let botOwnerBalanceBefore = await ethers.provider.getBalance(botOwner.address);

    console.log(`💰 [작전 전] 해커 지갑 잔액: ${ethers.formatEther(botOwnerBalanceBefore)} BNB`);
    console.log(`💰 [작전 전] 사령관 수금 지갑 잔액: ${ethers.formatEther(commanderBalanceBefore)} BNB\n`);

    // 3. 봇이 함정을 물었다!
    console.log("🚨 [3단계] 봇 알고리즘이 함정의 미끼(0.1 BNB)를 발견했습니다!");
    console.log(`🤖 봇 시스템: "수익률 10,000% 발견! 차익 거래 실행!"`);
    console.log(`💸 봇이 1 BNB를 투입하여 공격을 시도합니다...`);

    const botConnected = bot.connect(botOwner);
    try {
        const tx = await botConnected.attack(trap.target, { value: ethers.parseEther("1.0") });
        await tx.wait();
        console.log(`✅ [트랜잭션 승인됨] 봇은 방금 자기가 1 BNB를 내고 큰 돈을 훔친 줄 압니다!\n`);
    } catch (e) {
        console.log("에러:", e.message);
    }

    // 잔액 확인 (후)
    console.log("==================================================================");
    console.log("🔥 [결과 확인] 알고리즘 역공(살모넬라) 발동 후 잔액 변동");
    console.log("==================================================================\n");

    let commanderBalanceAfter = await ethers.provider.getBalance(commanderFakeWallet);
    let botOwnerBalanceAfter = await ethers.provider.getBalance(botOwner.address);

    console.log(`💀 [작전 후] 해커 지갑 잔액: ${ethers.formatEther(botOwnerBalanceAfter)} BNB (약 1 BNB 강제 납세당함)`);
    console.log(`💰 [작전 후] 사령관 수금 지갑 잔액: ${ethers.formatEther(commanderBalanceAfter)} BNB (해커의 1 BNB 완벽 흡수!)\n`);

    console.log("🎯 [작전 대성공] 상대 서버를 해킹하지 않고도 봇의 알고리즘을 이용해 합법적으로 돈을 빼앗았습니다!");
}

main().catch(console.error);
