require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
    console.log("🚀 [작전 개시] LGAI 토큰 유니스왑(DEX) 상장 스크립트 가동 중...");
    
    // 환경 설정
    const RPC_URL = process.env.SEPOLIA_RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // 주소 설정
    const LGAI_ADDRESS = "0xC8C2D7B7736C3B5eC4eD0F547791E4389A054512";
    const ROUTER_ADDRESS = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"; // Uniswap V2 Router on Sepolia

    // ABI 설정
    const LGAI_ABI = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)"
    ];
    
    const ROUTER_ABI = [
        "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
    ];

    const lgaiContract = new ethers.Contract(LGAI_ADDRESS, LGAI_ABI, wallet);
    const routerContract = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);

    console.log(`\n👨‍✈️ 사령관님 지갑 주소: ${wallet.address}`);
    
    // 잔액 확인
    const ethBalance = await provider.getBalance(wallet.address);
    const lgaiBalance = await lgaiContract.balanceOf(wallet.address);
    console.log(`💎 현재 잔액: ${ethers.formatEther(ethBalance)} ETH / ${ethers.formatUnits(lgaiBalance, 18)} LGAI`);

    if (ethBalance < ethers.parseEther("0.02")) {
        console.error("❌ 오류: 유동성을 공급하기 위한 이더리움(가스비 포함)이 부족합니다.");
        return;
    }

    // 상장 비율 설정 (1 ETH = 10,000 LGAI)
    // 0.01 ETH와 100 LGAI를 유동성 풀에 공급하여 초기 상장 가격을 세팅합니다.
    const amountETH = ethers.parseEther("0.01"); 
    const amountLGAI = ethers.parseUnits("100", 18); 

    console.log(`\n⏳ 1단계: 유니스왑 금고에 LGAI 접근 권한 부여(Approve) 중...`);
    const approveTx = await lgaiContract.approve(ROUTER_ADDRESS, amountLGAI);
    console.log(`- 트랜잭션 전송 완료! (해시: ${approveTx.hash})`);
    await approveTx.wait();
    console.log("✅ 승인(Approve) 완료!");

    console.log(`\n⏳ 2단계: 유니스왑(Uniswap V2) 금고에 유동성 풀(Liquidity Pool) 생성 및 코인 상장 중...`);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10분 후
    
    const addLiqTx = await routerContract.addLiquidityETH(
        LGAI_ADDRESS,
        amountLGAI,
        0, // slippage 무시 (첫 상장이므로)
        0,
        wallet.address,
        deadline,
        { value: amountETH }
    );
    
    console.log(`- 트랜잭션 전송 완료! 블록체인에 새겨지는 중입니다... (해시: ${addLiqTx.hash})`);
    await addLiqTx.wait();
    
    console.log("\n🎉🎉🎉 [상장 성공] 🎉🎉🎉");
    console.log(`LGAI 코인이 전 세계 탈중앙화 거래소(Uniswap)에 공식 상장되었습니다!`);
    console.log(`이제 누구나 ETH로 LGAI를 시장 가격으로 구매할 수 있습니다.`);
    console.log(`- 최초 형성 가격: 1 ETH = 10,000 LGAI`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
