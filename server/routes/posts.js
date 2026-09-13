// routes/posts.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
  const router = express.Router();

  // 전체 게시글 조회 (카테고리 필터, 정렬, 검색)
  router.get('/', (req, res) => {
    try {
      const { category, sort = 'latest', search, limit = 20, offset = 0 } = req.query;
      let query = 'SELECT * FROM posts WHERE 1=1';
      const params = [];
      if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
      if (search) { query += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      query += sort === 'popular' ? ' ORDER BY likes DESC, views DESC' : ' ORDER BY is_pinned DESC, created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const posts = db.prepare(query).all(...params);
      const total = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;

      // 각 게시글의 댓글 수 추가
      const result = posts.map(p => ({
        ...p,
        comment_count: db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(p.id).c
      }));

      res.json({ posts: result, total });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // 게시글 상세 (조회수 증가)
  router.get('/:id', (req, res) => {
    try {
      db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(req.params.id);
      const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const comments = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').all(req.params.id);
      res.json({ post, comments });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // 게시글 작성
  router.post('/', (req, res) => {
    try {
      const { author, avatar = '👤', lang = 'ko', category = 'general', title, content } = req.body;
      if (!author || !title || !content) return res.status(400).json({ error: 'Missing fields' });
      const id = uuidv4();
      db.prepare(`INSERT INTO posts (id, author, avatar, lang, category, title, content) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, author.substring(0,30), avatar, lang, category, title.substring(0,100), content.substring(0,2000));
      res.json({ success: true, id });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // 좋아요
  router.post('/:id/like', (req, res) => {
    try {
      db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
