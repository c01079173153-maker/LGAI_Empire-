const aiEngine = require('./bot/ai_engine');
const broadcaster = require('./bot/broadcaster');

async function testPromo() {
  console.log("Generating marketing content...");
  
  // AI 엔진을 사용하여 밈코인 홍보 카테고리의 글 생성 (무료 번역 API 사용)
  const persona = { name: 'LGAI_Marketing', avatar: '🚀' };
  const { title, content } = await aiEngine.generatePost('Meme Coin Hype', persona);
  
  console.log("Broadcasting to Telegram...");
  await broadcaster.broadcast(title, content);
  
  console.log("Done!");
}

testPromo();
