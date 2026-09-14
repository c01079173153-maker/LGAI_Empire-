// ══════════════════════════════════════════════════════
// LGAI AUTONOMOUS EMPIRE — MAIN SERVER v2
// 순수 Node.js + Express + JSON 파일 DB
// 네이티브 빌드 없이 어디서나 작동 ✅
// ══════════════════════════════════════════════════════
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const cron       = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { createDB }   = require('./db/database');
const autoBot    = require('./bot/auto_responder');
const scheduler  = require('./bot/scheduler');

const app  = express();
const PORT = process.env.PORT || 3000;
const db   = createDB();

// ── Middleware ──
app.use(cors());
app.use(express.json());
// public 폴더 (community.html)
app.use(express.static(path.join(__dirname, 'public')));
// 상위 폴더 (omniverse.html, omniverse.css, omniverse.js 등)
app.use(express.static(path.join(__dirname, '..')));

// ════════════════════════════════════
// API: POSTS
// ════════════════════════════════════
app.get('/api/posts', (req, res) => {
  const { category, sort, search, limit, offset } = req.query;
  const result = db.getAllPosts({ category, sort, search, limit: parseInt(limit)||20, offset: parseInt(offset)||0 });
  // 댓글 수 추가
  result.posts = result.posts.map(p => ({
    ...p,
    comment_count: db.getComments(p.id).length
  }));
  res.json(result);
});

app.get('/api/posts/trending', (req, res) => {
  res.json(db.getTrending(5));
});

app.get('/api/posts/:id', (req, res) => {
  const post = db.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  db.incrementViews(req.params.id);
  const comments = db.getComments(req.params.id);
  res.json({ post, comments });
});

app.post('/api/posts', (req, res) => {
  const { author, avatar = '👤', lang = 'ko', category = 'general', title, content } = req.body;
  if (!author || !title || !content) return res.status(400).json({ error: 'Missing fields' });
  const id = uuidv4();
  db.insertPost({ id, author: author.slice(0,30), avatar, lang, category, title: title.slice(0,100), content: content.slice(0,3000), is_bot: 0, is_pinned: 0 });
  res.json({ success: true, id });
});

app.post('/api/posts/:id/like', (req, res) => {
  db.likePost(req.params.id);
  res.json({ success: true });
});

// ════════════════════════════════════
// API: COMMENTS
// ════════════════════════════════════
app.post('/api/comments', (req, res) => {
  const { post_id, author, avatar = '👤', content } = req.body;
  if (!post_id || !author || !content) return res.status(400).json({ error: 'Missing fields' });
  const id = uuidv4();
  db.insertComment({ id, post_id, author: author.slice(0,30), avatar, content: content.slice(0,500), is_bot: 0 });
  res.json({ success: true, id });
});

app.post('/api/comments/:id/like', (req, res) => {
  db.likeComment(req.params.id);
  res.json({ success: true });
});

// ════════════════════════════════════
// API: STATS
// ════════════════════════════════════
app.get('/api/stats', (req, res) => {
  const stats = db.getStats();
  // 유저 수 살짝 증가 (생동감)
  db.updateStat('total_users', stats.total_users + Math.floor(Math.random() * 2));
  res.json(stats);
});

// ════════════════════════════════════
// PAGES & REDIRECTS
// ════════════════════════════════════
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, '..', 'omniverse.html')));
app.get('/community', (req, res) => res.sendFile(path.join(__dirname, 'public', 'community.html')));
app.get('/telegram',  (req, res) => res.redirect('https://t.me/LgaiEmpireOfficial')); // 텔레그램 공식 방 리다이렉트

// ══════════════════════════════════════════════════════
// 🤖 자율 AI 스케줄러 — 24/7 무인 운영
// ══════════════════════════════════════════════════════

// 매 2분: 미답변 글에 AI 자동 답변
cron.schedule('*/2 * * * *', () => {
  autoBot.respondToUnanswered(db).catch(console.error);
});

// 매 5분: 인기 게시글 자동 좋아요/조회 부스트
cron.schedule('*/5 * * * *', () => {
  db.randomBoostLikes();
});

// 매 6시간: 마케팅 콘텐츠 자동 게시
cron.schedule('0 */6 * * *', () => {
  scheduler.postMarketingContent(db).catch(console.error);
});

// 매일 오전 9시: 일일 소각 공지
cron.schedule('0 9 * * *', () => {
  scheduler.postDailyBurnAnnouncement(db).catch(console.error);
});

// 매일 오후 9시: 야간 시세 리포트
cron.schedule('0 21 * * *', () => {
  scheduler.postNightReport(db).catch(console.error);
});

// 매주 월요일 오전 10시: 주간 업데이트
cron.schedule('0 10 * * 1', () => {
  scheduler.postWeeklyUpdate(db).catch(console.error);
});

// ── 시작 ──
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🌌 LGAI AUTONOMOUS EMPIRE — ONLINE             ║');
  console.log(`║   🌐 http://localhost:${PORT}                        ║`);
  console.log(`║   📋 http://localhost:${PORT}/community             ║`);
  console.log('║   🤖 ALL BOTS ACTIVE — 24/7 자율 운영 중         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // 첫 실행 시 시드 데이터 삽입
  setTimeout(() => scheduler.seedInitialContent(db), 1500);
});
