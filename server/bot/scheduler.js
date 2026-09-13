// ══════════════════════════════════════════════════════
// 📢 LGAI AUTONOMOUS SCHEDULER v2 — JSON DB 기반
// ══════════════════════════════════════════════════════
const { v4: uuidv4 } = require('uuid');

function fmt(n) { return Math.floor(n).toLocaleString(); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const ADMIN = { name: 'LGAI_Admin', avatar: '🛡️' };

const MARKETING_TEMPLATES = [
  {
    category: 'announcement',
    title: () => `🔥 오늘의 LGAI 자동 소각 완료 — ${fmt(Math.random()*60000+30000)} LGAI 소각`,
    content: () => `RWA Burn Engine이 오늘도 자동으로 LGAI 소각을 실행했습니다.\n\n📊 **오늘 소각량**: ${fmt(Math.random()*60000+30000)} LGAI\n💰 **소각 재원**: 미국 국채(US Treasury) 이자 수익\n🔒 **누적 소각량**: ${fmt(Math.random()*1000000+10000000)} LGAI\n\n소각이 진행될수록 희소성이 높아집니다. 지금이 기회입니다! 🚀\n\n#LGAI #BurnEvent #RWA #DeFi`
  },
  {
    category: 'depin',
    title: () => `⚙️ DePIN 네트워크 업데이트 — 노드 ${fmt(Math.random()*100+1200)}개 돌파!`,
    content: () => `LGAI DePIN 네트워크가 계속 성장하고 있습니다!\n\n🌐 **현재 활성 노드**: ${fmt(Math.random()*100+1200)}개\n💎 **오늘 분배된 보상**: ${fmt(Math.random()*100000+500000)} LGAI\n📈 **현재 APY**: 142%\n\n아직 노드를 연결하지 않으셨다면 지금 바로 시작하세요!\n\n#DePIN #PassiveIncome #LGAI #Mining`
  },
  {
    category: 'alpha',
    title: () => '🧠 [알파 정보] LGAI가 주목받는 3가지 핵심 이유',
    content: () => `많은 분들이 LGAI를 단순 밈코인으로 오해하시는데, 전혀 다릅니다.\n\n**1. 실물 자산 담보** 🏛️\n미국 국채(US Treasury)가 직접 LGAI 가격을 지지합니다.\n\n**2. 자동 소각 메커니즘** 🔥\n매 24시간마다 AI가 자동으로 LGAI를 소각합니다.\n\n**3. DePIN + AI 복합 수익** ⚙️🤖\nGPU 채굴 + AI 차익거래 배당 + SocialFi 수수료. 3중 수익 구조.\n\n#LGAI #Web3 #RWA #DePIN #Alpha`
  },
  {
    category: 'market',
    title: () => `📊 [시세 업데이트] LGAI +${(Math.random()*15+2).toFixed(1)}% 상승 중`,
    content: () => `**LGAI 실시간 시세 업데이트**\n\n💰 현재가: $${(0.0001*(1+Math.random()*0.2)).toFixed(6)}\n📈 24시간 변동: **+${(Math.random()*15+2).toFixed(1)}%**\n🔥 오늘 소각: ${fmt(Math.random()*50000+20000)} LGAI\n⚙️ 활성 노드: ${fmt(Math.random()*100+1200)}개\n\n**AI 분석**: RWA 소각 엔진 가동 + DePIN 노드 증가로 공급 압박 지속. 상승 모멘텀 유지 중.\n\n#LGAI #MarketUpdate #DeFi #Crypto`
  },
  {
    category: 'community',
    title: () => '🌌 LGAI 커뮤니티 하이라이트 — 이번 주 뜨거운 소식',
    content: () => `이번 주 LGAI 커뮤니티에서 뜨거웠던 소식들!\n\n🏆 **이번 주 MVP**: 최다 DePIN 보상 노드 운영자\n💬 **인기 토론**: LGAI 스테이킹 전략\n🔥 **주간 소각**: ${fmt(Math.random()*300000+200000)} LGAI 완료\n🚀 **신규 멤버**: ${fmt(Math.random()*50+100)}명 합류\n\n함께 성장하는 Legion of the Future! 🫡\n#LGAI #Community #Web3 #Korea`
  },
];

let tmplIndex = 0;

async function postMarketingContent(db) {
  const tmpl = MARKETING_TEMPLATES[tmplIndex % MARKETING_TEMPLATES.length];
  tmplIndex++;
  db.insertPost({
    id: uuidv4(), author: ADMIN.name, avatar: ADMIN.avatar,
    lang: 'ko', category: tmpl.category,
    title: tmpl.title(), content: tmpl.content(),
    is_bot: 1, is_pinned: 0,
    likes: Math.floor(Math.random()*40+10),
    views: Math.floor(Math.random()*300+80)
  });
  // insertPost가 자동으로 created_at 추가하지만 likes/views는 덮어써야 함
  // DB의 insertPost 이후 랜덤 부스트
  db.randomBoostLikes();
  console.log(`  📢 [SCHEDULER] Marketing post published #${tmplIndex}`);
}

async function postDailyBurnAnnouncement(db) {
  const burned = fmt(Math.random()*60000+30000);
  db.insertPost({
    id: uuidv4(), author: ADMIN.name, avatar: ADMIN.avatar,
    lang: 'ko', category: 'announcement',
    title: `🔥 [일일 자동 소각 완료] ${burned} LGAI 소각`,
    content: `📋 **일일 자동 소각 리포트**\n\n✅ 소각 완료: ${new Date().toLocaleString('ko-KR')}\n🔥 오늘 소각량: **${burned} LGAI**\n💰 소각 재원: RWA 엔진 (미국 국채 이자)\n\n스마트 컨트랙트가 완전 자동으로 실행했습니다.\nEtherscan에서 투명하게 확인 가능합니다.\n\n🫡 Legion, 오늘도 제국이 성장합니다!`,
    is_bot: 1, is_pinned: 1,
    likes: Math.floor(Math.random()*80+40),
    views: Math.floor(Math.random()*500+200)
  });
  console.log('  🔥 [SCHEDULER] Daily burn posted.');
}

async function postNightReport(db) {
  const change = (Math.random()*15+2).toFixed(1);
  db.insertPost({
    id: uuidv4(), author: '📊 MarketBot', avatar: '📊',
    lang: 'ko', category: 'market',
    title: `📈 [야간 시세 리포트] LGAI +${change}% 마감`,
    content: `**LGAI 야간 시세 리포트** — ${new Date().toLocaleDateString('ko-KR')}\n\n💰 현재가: $${(0.0001*(1+Math.random()*0.15)).toFixed(6)}\n📈 24시간 변동: **+${change}%**\n📊 거래량: $${fmt(Math.random()*500000+100000)}\n🔥 오늘 소각: ${fmt(Math.random()*50000+20000)} LGAI\n\n**AI 분석**: 상승 모멘텀 지속 중. 공급 감소 + 수요 증가 = 가격 상승 압력.\n\n#LGAI #NightReport #DeFi`,
    is_bot: 1, is_pinned: 0,
    likes: Math.floor(Math.random()*50+20),
    views: Math.floor(Math.random()*300+100)
  });
  console.log('  📊 [SCHEDULER] Night report posted.');
}

async function postWeeklyUpdate(db) {
  db.insertPost({
    id: uuidv4(), author: ADMIN.name, avatar: ADMIN.avatar,
    lang: 'ko', category: 'announcement',
    title: '🌌 [주간 업데이트] LGAI 옴니버스 생태계 현황',
    content: `**LGAI 주간 업데이트** — ${new Date().toLocaleDateString('ko-KR')}\n\n**이번 주 성과:**\n✅ DePIN 신규 노드: +${Math.floor(Math.random()*50+20)}개\n✅ 주간 소각: ${fmt(Math.random()*300000+200000)} LGAI\n✅ SocialFi 새 토큰: ${Math.floor(Math.random()*5+3)}개\n✅ AI 수익: $${fmt(Math.random()*5000+2000)}\n✅ 신규 멤버: ${Math.floor(Math.random()*200+100)}명\n\n**다음 주 예정:**\n🔜 마켓플레이스 신규 카테고리\n🔜 스테이킹 보상 이벤트\n🔜 글로벌 파트너십 발표\n\nLegion of the Future! 🫡`,
    is_bot: 1, is_pinned: 1,
    likes: Math.floor(Math.random()*120+60),
    views: Math.floor(Math.random()*800+400)
  });
  console.log('  🌌 [SCHEDULER] Weekly update posted.');
}

async function seedInitialContent(db) {
  const stats = db.getStats();
  if (stats.total_posts > 0) { console.log('[SEED] Data exists, skipping.'); return; }
  console.log('[SEED] Inserting initial community content...');

  const seeds = [
    {
      author: ADMIN.name, avatar: ADMIN.avatar, category: 'announcement', is_pinned: 1,
      title: '🌌 LGAI 옴니버스 커뮤니티에 오신 것을 환영합니다!',
      content: 'Legion의 전사 여러분, 환영합니다! 🫡\n\n이 커뮤니티는 LGAI 생태계에 대한 모든 정보를 공유하고 토론하는 공간입니다.\n\n**커뮤니티 규칙:**\n1. 서로 존중하고 건설적인 토론을 해주세요\n2. 개인 투자 권유 금지\n3. 스팸/광고 금지\n4. DYOR (Do Your Own Research)\n\nTogether, we build the future! 🌌',
      likes: 89, views: 1247
    },
    {
      author: '🔭 CryptoWatcher', avatar: '🔭', category: 'alpha', is_pinned: 0,
      title: '📊 LGAI vs 기존 토큰 비교 분석 — 왜 다른가?',
      content: '많은 분들이 LGAI가 기존 토큰과 뭐가 다른지 물어보셔서 분석해봤습니다.\n\n**일반 밈코인:**\n❌ 실제 가치 없음\n❌ 팀 물량 덤핑 위험\n\n**LGAI:**\n✅ 미국 국채로 가치 지지\n✅ 스마트 컨트랙트 자동 소각\n✅ DePIN 실제 유틸리티\n✅ AI 차익거래 배당\n\n구조적으로 장기 보유자에게 매우 유리합니다.',
      likes: 67, views: 892
    },
    {
      author: '⚙️ Web3Builder', avatar: '⚙️', category: 'depin', is_pinned: 0,
      title: '⚙️ DePIN 노드 설치 후기 — RTX 4080으로 한 달 채굴 결과',
      content: '지난 달부터 DePIN 노드를 운영하고 있는데 후기 공유합니다!\n\n**제 스펙:**\n- GPU: RTX 4080 (16GB)\n- 하루 전기요금: 약 600원\n- 하루 채굴량: 160 LGAI\n\n**한 달 결과:**\n- 총 채굴: 4,800 LGAI\n- 전기요금: 18,000원\n- 충분히 플러스!\n\n설치가 생각보다 정말 간단했어요. 지갑 주소 + GPU 스펙 입력하면 끝!',
      likes: 45, views: 634
    },
    {
      author: '👑 HODLKing', avatar: '👑', category: 'discussion', is_pinned: 0,
      title: '💬 LGAI 1년 HODL 시뮬레이션 — 얼마나 벌 수 있을까?',
      content: '순수 계산으로 1년 HODL 시뮬레이션을 해봤습니다.\n\n**가정:**\n- 현재 가격: $0.0001\n- 연간 소각률: 5% (RWA 엔진)\n- 스테이킹 APR: 38%\n\n**시나리오 (스테이킹 포함):**\n1,000만 LGAI → 1년 후 1,380만 LGAI\n공급 5% 감소 → 이론상 가격 +40~60% 가능\n\n물론 보장은 없지만 구조적으로 흥미롭습니다. 여러분 생각은?',
      likes: 38, views: 423
    },
    {
      author: '🧠 AlphaLeaker', avatar: '🧠', category: 'alpha', is_pinned: 0,
      title: '🧠 Omni-chain AI 차익거래 봇 — 어떻게 작동하나?',
      content: 'LGAI의 Omni-chain AI 에이전트가 어떻게 수익을 내는지 설명합니다.\n\n**4개 체인 동시 모니터링:**\n🔵 Ethereum → DEX 가격차 포착\n🟣 Solana → 초고속 거래 실행\n🔴 Avalanche → 서브넷 차익\n🔷 Base → L2 가격 차이 활용\n\n**수익 배분:**\n50% → LGAI 스테이커 배당\n30% → LGAI 소각\n20% → 운영 자금\n\n완전 자율 운영이라 사람 개입 없이 24/7 작동합니다!',
      likes: 52, views: 671
    },
  ];

  for (const seed of seeds) {
    const id = require('uuid').v4();
    db.insertPost({ id, lang: 'ko', is_bot: 1, ...seed });
    // 씨앗 댓글
    const seedComments = [
      { author: '⚡ LegionMember', avatar: '⚡', content: '정말 도움이 되는 정보 감사합니다! LGAI 화이팅 🔥' },
      { author: '🔭 CryptoWatcher', avatar: '🔭', content: '좋은 인사이트입니다. 저도 비슷한 생각을 하고 있었어요!' },
    ];
    for (const c of seedComments) {
      db.insertComment({ id: require('uuid').v4(), post_id: id, lang: 'ko', is_bot: 1, is_answered: 0, ...c });
    }
  }

  await postDailyBurnAnnouncement(db);
  await postMarketingContent(db);
  console.log('[SEED] ✅ Done!');
}

module.exports = { postMarketingContent, postDailyBurnAnnouncement, postNightReport, postWeeklyUpdate, seedInitialContent };
