// ══════════════════════════════════════════════════════
// 순수 JSON 파일 기반 DB — 네이티브 빌드 없이 어디서나 작동
// ══════════════════════════════════════════════════════
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'lgai_empire.json');

// 기본 스키마
const DEFAULT_DB = {
  posts: [],
  comments: [],
  stats: {
    total_users: 1247,
    total_burned: 0,
    lgai_price: 0.0001,
    market_cap: 100000
  }
};

// DB 로드
function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch(e) {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

// DB 저장 (debounce로 빈번한 디스크 쓰기 방지)
let saveTimer = null;
function save(db) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }, 200);
}

// DB 래퍼 객체 — SQLite처럼 prepare/run/get/all 인터페이스 흉내
function createDB() {
  let data = load();

  const api = {
    // 게시글
    getAllPosts({ category, sort, search, limit = 20, offset = 0 } = {}) {
      let posts = [...data.posts];
      if (category && category !== 'all') posts = posts.filter(p => p.category === category);
      if (search) {
        const q = search.toLowerCase();
        posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
      }
      if (sort === 'popular') posts.sort((a, b) => (b.likes + b.views * 0.1) - (a.likes + a.views * 0.1));
      else posts.sort((a, b) => {
        if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      return { posts: posts.slice(offset, offset + limit), total: posts.length };
    },

    getPost(id) {
      return data.posts.find(p => p.id === id) || null;
    },

    insertPost(post) {
      data.posts.unshift({ ...post, likes: 0, views: 0, created_at: new Date().toISOString() });
      save(data);
    },

    incrementViews(id) {
      const p = data.posts.find(p => p.id === id);
      if (p) { p.views++; save(data); }
    },

    likePost(id) {
      const p = data.posts.find(p => p.id === id);
      if (p) { p.likes++; save(data); }
    },

    // 댓글
    getComments(postId) {
      return data.comments.filter(c => c.post_id === postId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },

    insertComment(comment) {
      data.comments.push({ ...comment, likes: 0, is_answered: 0, created_at: new Date().toISOString() });
      save(data);
    },

    likeComment(id) {
      const c = data.comments.find(c => c.id === id);
      if (c) { c.likes++; save(data); }
    },

    // 봇용: 미답변 포스트 찾기
    getUnansweredPosts() {
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;
      const answeredPostIds = new Set(data.comments.filter(c => c.is_bot).map(c => c.post_id));
      return data.posts.filter(p =>
        !p.is_bot &&
        !answeredPostIds.has(p.id) &&
        new Date(p.created_at).getTime() > cutoff
      ).slice(0, 5);
    },

    getUnansweredComments() {
      const cutoff = Date.now() - 12 * 60 * 60 * 1000;
      return data.comments.filter(c =>
        !c.is_bot && !c.is_answered &&
        new Date(c.created_at).getTime() > cutoff
      ).slice(0, 3);
    },

    markCommentAnswered(id) {
      const c = data.comments.find(c => c.id === id);
      if (c) { c.is_answered = 1; save(data); }
    },

    // 통계
    getStats() {
      return {
        ...data.stats,
        total_posts: data.posts.length,
        total_comments: data.comments.length
      };
    },

    updateStat(key, value) {
      data.stats[key] = value;
      save(data);
    },

    // 인기 포스트 (트렌딩용)
    getTrending(limit = 5) {
      return [...data.posts]
        .sort((a, b) => (b.likes + b.views * 0.1) - (a.likes + a.views * 0.1))
        .slice(0, limit);
    },

    // 랜덤 포스트 좋아요 증가 (활성화 시뮬레이션)
    randomBoostLikes() {
      const shuffled = [...data.posts].sort(() => Math.random() - 0.5).slice(0, 3);
      shuffled.forEach(p => { p.likes += Math.floor(Math.random() * 5 + 1); p.views += Math.floor(Math.random() * 10 + 3); });
      save(data);
    },

    // 데이터 리로드 (외부에서 직접 파일 수정 시)
    reload() { data = load(); }
  };

  return api;
}

module.exports = { createDB };
