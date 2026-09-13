// routes/comments.js + routes/stats.js (합본)
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// 댓글 라우터
const commentsRouter = (db) => {
  const router = express.Router();
  router.post('/', (req, res) => {
    try {
      const { post_id, author, avatar = '👤', content } = req.body;
      if (!post_id || !author || !content) return res.status(400).json({ error: 'Missing fields' });
      const id = uuidv4();
      db.prepare(`INSERT INTO comments (id, post_id, author, avatar, content) VALUES (?, ?, ?, ?, ?)`)
        .run(id, post_id, author.substring(0,30), avatar, content.substring(0,500));
      res.json({ success: true, id });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/:id/like', (req, res) => {
    try {
      db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  return router;
};

// 통계 라우터
const statsRouter = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM stats').all();
      const stats = {};
      rows.forEach(r => stats[r.key] = r.value);
      stats.total_posts    = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
      stats.total_comments = db.prepare('SELECT COUNT(*) as c FROM comments').get().c;
      // 랜덤하게 살아있는 느낌 추가
      stats.total_users = String(parseInt(stats.total_users || 1247) + Math.floor(Math.random() * 3));
      db.prepare('UPDATE stats SET value = ? WHERE key = ?').run(stats.total_users, 'total_users');
      res.json(stats);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  return router;
};

module.exports = { commentsRouter, statsRouter };
