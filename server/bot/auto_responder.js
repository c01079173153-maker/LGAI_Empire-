// ══════════════════════════════════════════════════════
// 🤖 LGAI AI AUTO-RESPONDER BOT v2
// JSON DB 기반 — 네이티브 빌드 없이 작동
// ══════════════════════════════════════════════════════
const { v4: uuidv4 } = require('uuid');
const aiEngine = require('./ai_engine'); // 추가된 AI 코어 엔진 연동

const BOT_PERSONAS = [
  { name: 'LGAI_Admin',    avatar: '🛡️' },
  { name: 'CryptoWatcher', avatar: '🔭' },
  { name: 'DegenTrader',   avatar: '🦅' },
  { name: 'Web3Builder',   avatar: '⚙️' },
  { name: 'LegionMember',  avatar: '⚡' },
  { name: 'AlphaLeaker',   avatar: '🧠' },
  { name: 'HODLKing',      avatar: '👑' },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function respondToUnanswered(db) {
  // 미답변 게시글
  const posts = db.getUnansweredPosts();
  for (const post of posts) {
    await delay(Math.random() * 6000 + 2000);
    const persona = pick(BOT_PERSONAS);
    // AI 연동: 진짜 생성형 AI를 이용해 다국어 답변 생성!
    const aiText = await aiEngine.generateReply(post.title + '\n' + post.content, persona.name);
    
    db.insertComment({ id: uuidv4(), post_id: post.id, author: persona.name, avatar: persona.avatar, content: aiText, is_bot: 1, is_answered: 0 });
    console.log(`  🤖 [AI-AUTO-REPLY] @${persona.name} → "${post.title.slice(0,30)}..."`);
  }

  // 미답변 댓글
  const comments = db.getUnansweredComments();
  for (const c of comments) {
    await delay(Math.random() * 5000 + 1500);
    const persona = pick(BOT_PERSONAS);
    // AI 연동: 댓글에도 맞춤형 답변!
    const aiText = await aiEngine.generateReply(c.content, persona.name);

    db.insertComment({ id: uuidv4(), post_id: c.post_id, author: persona.name, avatar: persona.avatar, content: aiText, is_bot: 1, is_answered: 0 });
    db.markCommentAnswered(c.id);
    console.log(`  💬 [AI-REPLY-COMMENT] @${persona.name}`);
  }
}

module.exports = { respondToUnanswered };
