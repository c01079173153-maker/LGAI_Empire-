// ══════════════════════════════════════════════════════
// 🤖 LGAI AI AUTO-RESPONDER BOT v2
// JSON DB 기반 — 네이티브 빌드 없이 작동
// ══════════════════════════════════════════════════════
const { v4: uuidv4 } = require('uuid');

const BOT_PERSONAS = [
  { name: 'LGAI_Admin',    avatar: '🛡️' },
  { name: 'CryptoWatcher', avatar: '🔭' },
  { name: 'DegenTrader',   avatar: '🦅' },
  { name: 'Web3Builder',   avatar: '⚙️' },
  { name: 'LegionMember',  avatar: '⚡' },
  { name: 'AlphaLeaker',   avatar: '🧠' },
  { name: 'HODLKing',      avatar: '👑' },
];

const RESPONSES = {
  price: [
    "LGAI의 RWA Burn Engine이 매일 자동 소각을 실행하기 때문에 장기적으로 우상향이 예상됩니다! 🔥",
    "DePIN 노드 수가 늘어날수록 LGAI 수요도 증가합니다. 지금이 가장 저점이라고 봐요 👀",
    "RWA 엔진이 매 24시간마다 LGAI를 소각하고 있어서 공급이 계속 줄어들고 있습니다. 희소성 = 가치 상승! 📈",
    "현재 스테이킹 APR 38% 제공 중입니다. 단순 보유보다 스테이킹이 훨씬 유리해요!",
  ],
  depin: [
    "DePIN 노드 연결은 정말 쉽습니다! GPU 스펙만 입력하면 자동으로 LGAI가 채굴돼요 ⚙️",
    "현재 1,247개 이상의 노드가 가동 중입니다. 빨리 합류할수록 더 많은 보상을 받을 수 있어요!",
    "RTX 4090 기준으로 하루 약 240 LGAI를 채굴할 수 있습니다. 전기료 대비 충분히 수익이 납니다 💰",
    "DePINVault 스마트 컨트랙트가 자동으로 보상을 분배합니다. 연결하면 아무것도 안 해도 됩니다!",
  ],
  rwa: [
    "RWA Burn Engine은 미국 국채 이자를 자동으로 LGAI 소각에 사용합니다. 완전 자율 운영이에요! 🏛️",
    "매일 자정에 자동 소각이 실행됩니다. 러그풀이 수학적으로 불가능한 구조입니다.",
    "TVL이 늘어날수록 소각량도 늘어납니다. 진정한 디플레이션 토큰! 🔥",
  ],
  staking: [
    "현재 스테이킹 APR 38%! 30일 락업 후 매일 자동으로 수익이 지급됩니다 💰",
    "Omni-chain AI가 ETH, SOL, AVAX, BASE를 동시에 스캔해서 차익거래 수익을 스테이커들에게 분배해요",
  ],
  socialfi: [
    "팬 토큰 발행이 3클릭만에 완료됩니다! 지금 바로 런치패드에서 만들어보세요 🎨",
    "모든 팬 토큰은 LGAI로만 구매 가능 → LGAI 수요 증가 → 가격 상승의 선순환입니다!",
  ],
  listing: [
    "로드맵 상 Phase 4(CEX 상장)는 Phase 3 완전 안착 후 진행됩니다. 커뮤니티 성장이 핵심입니다! 🚀",
    "빠르면 Q4 2026 내에 첫 CEX 상장을 목표로 하고 있습니다!",
  ],
  general: [
    "좋은 질문입니다! LGAI 커뮤니티에 오신 것을 환영합니다 🌌 더 궁금한 점이 있으면 언제든 물어보세요!",
    "LGAI 생태계에 관심 가져주셔서 감사합니다! 공식 텔레그램 채널에도 참여해 보세요 ⚡",
    "정확한 정보를 위해 whitepaper와 공식 문서를 확인해 보세요. 항상 DYOR! 🧠",
    "좋은 인사이트입니다! LGAI 커뮤니티가 함께 성장하고 있습니다. Legion of the Future! 🫡",
  ],
};

function detectTopic(text) {
  const t = text.toLowerCase();
  if (t.match(/가격|price|시세|얼마|올라|내려/)) return 'price';
  if (t.match(/depin|gpu|노드|채굴|hardware/)) return 'depin';
  if (t.match(/rwa|소각|burn|국채|treasury/)) return 'rwa';
  if (t.match(/스테이킹|staking|apr|이자|수익|배당/)) return 'staking';
  if (t.match(/socialfi|팬토큰|fan.?token|크리에이터|creator/)) return 'socialfi';
  if (t.match(/언제|when|상장|cex|listing|binance|upbit/)) return 'listing';
  return 'general';
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function respondToUnanswered(db) {
  // 미답변 게시글
  const posts = db.getUnansweredPosts();
  for (const post of posts) {
    await delay(Math.random() * 6000 + 2000);
    const persona = pick(BOT_PERSONAS);
    const topic   = detectTopic(post.title + ' ' + post.content);
    const text    = pick(RESPONSES[topic] || RESPONSES.general);
    db.insertComment({ id: uuidv4(), post_id: post.id, author: persona.name, avatar: persona.avatar, content: text, is_bot: 1, is_answered: 0 });
    console.log(`  🤖 [AUTO-REPLY] @${persona.name} → "${post.title.slice(0,30)}..."`);
  }

  // 미답변 댓글
  const comments = db.getUnansweredComments();
  for (const c of comments) {
    await delay(Math.random() * 5000 + 1500);
    const persona = pick(BOT_PERSONAS);
    const topic   = detectTopic(c.content);
    const text    = pick(RESPONSES[topic] || RESPONSES.general);
    db.insertComment({ id: uuidv4(), post_id: c.post_id, author: persona.name, avatar: persona.avatar, content: text, is_bot: 1, is_answered: 0 });
    db.markCommentAnswered(c.id);
    console.log(`  💬 [AUTO-REPLY-COMMENT] @${persona.name}`);
  }
}

module.exports = { respondToUnanswered };
