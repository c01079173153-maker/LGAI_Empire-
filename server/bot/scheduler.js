const { v4: uuidv4 } = require('uuid');
const aiEngine = require('./ai_engine');
const broadcaster = require('./broadcaster'); // 마케팅 브로드캐스터 추가

function fmt(n) { return Math.floor(n).toLocaleString(); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const ADMIN = { name: 'LGAI_Admin', avatar: '🛡️' };
const BOT_PERSONAS = [
  { name: 'CryptoWatcher', avatar: '🔭' },
  { name: 'DegenTrader',   avatar: '🦅' },
  { name: 'Web3Builder',   avatar: '⚙️' },
  { name: 'AlphaLeaker',   avatar: '🧠' }
];
const CATEGORIES = ['depin', 'rwa', 'socialfi', 'alpha', 'market', 'discussion'];

async function postMarketingContent(db) {
  try {
    const category = pick(CATEGORIES);
    const persona = pick(BOT_PERSONAS);
    
    // AI 연동: 카테고리에 맞는 영문 기반 포스트 창작 (객체 반환)
    const aiData = await aiEngine.generatePost(category, persona.name);
    
    let title = aiData.title || `[${category.toUpperCase()}] Alpha Drop by ${persona.name}`;
    let content = aiData.content || aiData;

    // Twitter (X) 포스팅용 데이터 준비 (280자 제한)
    const twitterContent = content.length > 270 ? content.slice(0, 270) + "..." : content;

    db.insertPost({
      id: uuidv4(), author: persona.name, avatar: persona.avatar,
      lang: 'en', category: category,
      title: title.slice(0, 100), content: content.slice(0, 3000),
      is_bot: 1, is_pinned: 0,
      likes: Math.floor(Math.random()*40+10),
      views: Math.floor(Math.random()*300+80)
    });
    
    db.randomBoostLikes();
    console.log(`  📢 [AI-SCHEDULER] Post published in '${category}' by @${persona.name}`);
    
    // 텔레그램 브로드캐스팅 (MarkdownV2 특수문자 방어 로직은 broadcaster 내부에 구현)
    await broadcaster.broadcast(title, content);
    
    // TODO: Phase 12 - Twitter (X) API 연동 시 주석 해제
    // await aiEngine.postToTwitter(title, twitterContent);

  } catch (error) {
    console.error("  ❌ [AI-SCHEDULER] Error during marketing post generation:", error.message);
    // 에러 발생 시 서버가 죽지 않고 자가 복구(Skip) 하도록 방어
  }
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
    }
  ];

  for (const seed of seeds) {
    const id = require('uuid').v4();
    db.insertPost({ id, lang: 'ko', is_bot: 1, ...seed });
  }

  await postDailyBurnAnnouncement(db);
  await postMarketingContent(db);
  console.log('[SEED] ✅ Done!');
}

module.exports = { postMarketingContent, postDailyBurnAnnouncement, postNightReport, postWeeklyUpdate, seedInitialContent };
