// 무료 구글 번역 API (API 키 불필요, 요금 없음)
async function freeTranslate(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetch(url);
    const d = await r.json();
    return {
      text: d[0].map(x => x[0]).join(''),
      detectedLang: d[2]
    };
  } catch(e) {
    console.error("Translation error:", e);
    return { text: text, detectedLang: 'en' };
  }
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ==========================================
// 🌌 QUANTUM PROCEDURAL GENERATION ENGINE
// ==========================================

// 시장 감정 수학적 시뮬레이터 (BULLISH, BEARISH, NEUTRAL)
function simulateMarketMood() {
  const rand = Math.random();
  if (rand > 0.65) return 'BULLISH (강세장 감지)';
  if (rand < 0.25) return 'BEARISH (약세 방어 태세)';
  return 'NEUTRAL (안정화 구간)';
}

// 다중 페르소나 단어장 (절차적 블록)
const QUANTUM_VOCAB = {
  BULLISH: [
    "Quantum computing signals a massive uptrend for LGAI.",
    "Neural algorithms detect an unprecedented supply shock.",
    "Whale accumulation detected via hyper-ledger scans.",
    "The RWA Burn Engine is firing on all cylinders.",
    "Prepare for a parabolic shift in the Omni-chain ecosystem."
  ],
  BEARISH: [
    "Market turbulence is easily absorbed by the LGAI AI defense matrix.",
    "Smart money is aggressively accumulating the dip.",
    "Weak hands shaken out; Legion AI remains mathematically steadfast.",
    "The autonomous burn algorithm is intensifying to stabilize token value.",
    "Bear markets are just building phases for the Quantum Empire."
  ],
  NEUTRAL: [
    "DePIN node metrics show steady global expansion.",
    "System nominal. Omni-chain synchronization holding at 99.9%.",
    "SocialFi layer activity stabilizing at optimal neural levels.",
    "Algorithmic liquidity rebalancing is in progress.",
    "The Legion AI Swarm is silently monitoring all Layer 2 channels."
  ],
  HOOKS: [
    "Don't fade the AI revolution. Buy $LGAI.",
    "The future belongs to the Legion.",
    "Are you ready for the quantum leap in crypto?",
    "Smart contracts, smarter AI.",
    "Join the autonomous empire before the masses do."
  ],
  TAGS: [ "#LGAI", "#AI", "#DePIN", "#Crypto", "#1000xGem", "#Web3", "#RWA", "#Memecoin" ]
};

// 카테고리별 핵심 메시지 풀
const TOPICS = {
  depin: "Our Decentralized Physical Infrastructure (DePIN) is processing millions of neural requests daily. Hardware perfectly meets AI.",
  rwa: "Real-World Assets are being tokenized and funneled straight into our hyper-burn engine. Hyper-deflation is inevitable.",
  socialfi: "Legion's SocialFi ecosystem rewards genuine human creators while bots are filtered out. Engage, earn, and evolve.",
  alpha: "Exclusive Alpha: Top-tier predictive algorithms suggest a major liquidity influx for LGAI in the next 72 hours.",
  market: "Automated market maker algorithms are actively optimizing liquidity pools. Slippage minimized, capital efficiency maximized.",
  discussion: "The Legion AI community is the true intelligence behind the swarm. Keep building, keep holding."
};

async function generateReply(postText, personaName) {
  try {
    const transResult = await freeTranslate(postText, 'en');
    const userLang = transResult.detectedLang || 'en';
    
    // 시뮬레이터 가동
    const moodRaw = simulateMarketMood();
    const moodKey = moodRaw.split(' ')[0]; // BULLISH, BEARISH, NEUTRAL 추출
    
    // 절차적 답변 조립
    const moodPhrase = pick(QUANTUM_VOCAB[moodKey]);
    const hook = pick(QUANTUM_VOCAB.HOOKS);
    
    let englishReply = `[${personaName} Neural Scan] Analyzing input through the quantum matrix: ${moodPhrase} ${hook}`;
    
    // 사용자 모국어로 완벽 번역 회귀
    if (userLang !== 'en') {
      const finalTrans = await freeTranslate(englishReply, userLang);
      return finalTrans.text;
    }
    return englishReply;
  } catch (error) {
    return "The Legion AI defense matrix acknowledges your input. 🌌";
  }
}

async function generatePost(category, personaName) {
  try {
    // 1. 시장 감정 시뮬레이션
    const moodRaw = simulateMarketMood();
    const moodKey = moodRaw.split(' ')[0];
    
    // 2. 카테고리 매칭
    const topicKey = TOPICS[category] ? category : pick(Object.keys(TOPICS));
    const coreMessage = TOPICS[topicKey];
    
    // 3. 문장 블록 무작위 조립 (절차적 생성)
    const moodPhrase = pick(QUANTUM_VOCAB[moodKey]);
    const hook = pick(QUANTUM_VOCAB.HOOKS);
    const tag1 = pick(QUANTUM_VOCAB.TAGS);
    let tag2 = pick(QUANTUM_VOCAB.TAGS);
    while(tag1 === tag2) tag2 = pick(QUANTUM_VOCAB.TAGS); // 태그 중복 방지
    
    // 4. 타이틀 및 본문 포맷팅
    const titlePrefix = moodKey === 'BULLISH' ? '🚀 [HYPER-ALERT]' : moodKey === 'BEARISH' ? '🛡️ [DEFENSE MATRIX]' : '🌌 [SYSTEM UPDATE]';
    const title = `${titlePrefix} ${personaName}'s Quantum Analysis on ${category.toUpperCase()}`;
    
    const content = `${coreMessage}\n\n🧠 AI Market Sentiment: ${moodRaw}\n⚡ System Log: ${moodPhrase}\n\n${hook}\n\n${tag1} ${tag2}`;
    
    return { title, content };
  } catch (error) {
    return {
      title: "🔥 LGAI Network Update",
      content: "LGAI Autonomous Empire is expanding. Join the DePIN network! 🌍"
    };
  }
}

module.exports = { generateReply, generatePost };
