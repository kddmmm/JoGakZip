const express = require('express');
const { updatePost, deletePost, getPostById, likePost, checkPostAccess, isPostPublic } = require('../controllers/PostController');
const { createComment, getCommentsByPost } = require('../controllers/CommentController');
const router = express.Router();

// 게시글 상세 조회
router.get('/:postId', getPostById);

// 게시글 수정
router.put('/:postId', updatePost);

// 게시글 삭제
router.delete('/:postId', deletePost);

// 게시글 공감하기
router.post('/:postId/like', likePost);

// 게시글 비밀번호 확인 라우트
router.post('/:postId/verify-password', checkPostAccess);

// 게시글 공개 여부 확인
router.get('/:postId/is-public', isPostPublic);

// 댓글 등록
router.post('/:postId/comments', createComment);

// 댓글 목록 조회
router.get('/:postId/comments', getCommentsByPost);

module.exports = router;
