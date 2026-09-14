// 무료 구글 번역 API (API 키 불필요, 요금 없음)
async function freeTranslate(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetch(url);
    const d = await r.json();
    return {
      text: d[0].map(x => x[0]).join(''),
      detectedLang: d[2] // 'en', 'ko', 'fr', 'ja' 등 감지된 언어 코드
    };
  } catch(e) {
    console.error("Translation error:", e);
    return { text: text, detectedLang: 'en' };
  }
}

// 글로벌 대응을 위한 영문 마스터 데이터베이스
const RESPONSES = {
  price: [
    "The RWA Burn Engine executes daily auto-burns, so long-term upward trends are expected! 🔥",
    "As DePIN nodes increase, LGAI demand grows. This is the absolute bottom 👀",
    "The RWA engine burns LGAI every 24 hours. Scarcity = Value! 📈",
    "Currently offering 38% staking APR. Staking is much better than just holding!"
  ],
  depin: [
    "Connecting a DePIN node is super easy! Just input your GPU specs to start mining LGAI ⚙️",
    "Over 1,247 nodes are active now. The earlier you join, the more rewards you get!",
    "An RTX 4090 can mine about 240 LGAI per day. Very profitable compared to electricity costs 💰",
    "DePINVault smart contract distributes rewards automatically. Just connect and relax!"
  ],
  rwa: [
    "The RWA Burn Engine automatically uses US Treasury yields to burn LGAI. Fully autonomous! 🏛️",
    "Auto-burn executes every midnight. A rug pull is mathematically impossible.",
    "As TVL grows, the burn amount increases. A true deflationary token! 🔥"
  ],
  staking: [
    "Current Staking APR is 38%! After a 30-day lockup, yields are paid daily 💰",
    "Omni-chain AI scans ETH, SOL, AVAX, and BASE to distribute arbitrage profits to stakers!"
  ],
  socialfi: [
    "Issuing a Fan Token takes just 3 clicks! Try it on the launchpad now 🎨",
    "All Fan Tokens can only be bought with LGAI → LGAI demand goes up!"
  ],
  general: [
    "Great question! Welcome to the LGAI Community 🌌 Feel free to ask anything!",
    "Thanks for your interest in the LGAI ecosystem! Make sure to join our official Telegram ⚡",
    "For accurate information, check our whitepaper and official docs. Always DYOR! 🧠",
    "Great insight! The LGAI community is growing together. Legion of the Future! 🫡"
  ]
};

function detectTopic(text) {
  const t = text.toLowerCase();
  if (t.match(/price|value|pump|dump|moon|how much/)) return 'price';
  if (t.match(/depin|gpu|node|mine|mining|hardware/)) return 'depin';
  if (t.match(/rwa|burn|treasury|yield/)) return 'rwa';
  if (t.match(/stake|staking|apr|apy|reward/)) return 'staking';
  if (t.match(/social|fan|token|creator/)) return 'socialfi';
  return 'general';
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function generateReply(postText, personaName) {
  try {
    // 1. 유저의 글을 영어로 번역하면서 원본 언어(detectedLang)를 감지
    const transResult = await freeTranslate(postText, 'en');
    const userLang = transResult.detectedLang || 'en';
    const englishText = transResult.text;

    // 2. 번역된 영어를 바탕으로 문맥(주제) 파악
    const topic = detectTopic(englishText);
    
    // 3. 주제에 맞는 영문 답변 선택
    const englishReply = pick(RESPONSES[topic] || RESPONSES.general);
    
    // 4. 유저의 원래 언어로 다시 번역해서 리턴! (완벽한 다국어 흉내)
    if (userLang !== 'en') {
      const finalTrans = await freeTranslate(englishReply, userLang);
      return finalTrans.text;
    }
    
    return englishReply;
  } catch (error) {
    return "Thank you for participating in the LGAI ecosystem! 🚀";
  }
}

async function generatePost(category, personaName) {
  try {
    const topic = (category === 'alpha' || category === 'market' || category === 'discussion') ? 'general' : category;
    const baseText = pick(RESPONSES[topic] || RESPONSES.general);
    
    return {
      title: `🚨 Breaking: LGAI ${category.toUpperCase()} Update!`,
      content: baseText + "\n\n#LGAI #" + category.toUpperCase().replace(/\s/g, '')
    };
  } catch (error) {
    return {
      title: "🔥 LGAI Network Update",
      content: "LGAI Autonomous Empire is expanding. Join the DePIN network! 🌍"
    };
  }
}

module.exports = { generateReply, generatePost };
