const express = require('express');
const { updatePost, deletePost, getPostById, likePost, checkPostAccess, isPostPublic } = require('../controllers/PostController');
const { createComment, getCommentsByPost } = require('../controllers/CommentController');
const router = express.Router();

// 게시글 상세 조회
router.get('/api/posts/:postId', getPostById);

// 게시글 수정
router.put('/api/posts/:postId', updatePost);

// 게시글 삭제
router.delete('/api/posts/:postId', deletePost);

// 게시글 공감하기
router.post('/api/posts/:postId/like', likePost);

// 게시글 조회 권한 확인
router.post('/api/posts/:postId/verify-password', checkPostAccess);

// 게시글 공개 여부 확인
router.get('/api/posts/:postId/is-public', isPostPublic);

// 댓글 등록
router.post('/api/posts/:postId/comments', createComment);

// 댓글 목록 조회
router.get('/api/posts/:postId/comments', getCommentsByPost);

module.exports = router;
