require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// [LegionAI Honeypot Watcher Radar]
// 미끼 지갑 주소: 0x2Dc46Dc520a8d1D589494E9384F7e2fd3a8801Fd
// 이 스크립트는 미끼 지갑에서 자금이 빠져나가는 트랜잭션을 실시간으로 감시합니다.

const HONEYPOT_ADDRESS = "0x2Dc46Dc520a8d1D589494E9384F7e2fd3a8801Fd";

async function startHoneypotRadar() {
    console.log("==================================================");
    console.log("🪤 [OPERATION HONEYPOT] RADAR ACTIVATED 🪤");
    console.log("==================================================");
    console.log(`📡 미끼 지갑 감시 중: ${HONEYPOT_ADDRESS}`);
    
    // 무료 RPC 노드 사용 (Binance Smart Chain)
    const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

    // 최신 블록이 생성될 때마다 감시
    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true); // 트랜잭션 정보 포함
            if (!block || !block.prefetchedTransactions) return;

            for (const tx of block.prefetchedTransactions) {
                // 누군가 미끼 지갑(From)에서 돈을 빼갔다면!
                if (tx.from && tx.from.toLowerCase() === HONEYPOT_ADDRESS.toLowerCase()) {
                    console.log(`\n🚨 [BINGO! 봇 낚임!] 미끼 지갑에서 트랜잭션 발생!`);
                    console.log(`💀 해커 봇 본거지 (To): ${tx.to}`);
                    console.log(`🧾 트랜잭션 해시: ${tx.hash}`);
                    
                    // 파일에 해커 주소 기록 (나중에 블랙리스트에 대량 등록하기 위함)
                    const logData = `[${new Date().toISOString()}] Bot Caught: ${tx.to} (Tx: ${tx.hash})\n`;
                    fs.appendFileSync('caught_bots.txt', logData);
                    console.log(`✅ 해커 주소가 caught_bots.txt 에 성공적으로 저장되었습니다!`);
                }
            }
        } catch (error) {
            // RPC 에러 무시
        }
    });
}

startHoneypotRadar().catch(console.error);
