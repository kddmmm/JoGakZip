const express = require('express');
const { createComment, updateComment, deleteComment, getCommentsByPost } = require('../controllers/CommentController');

const router = express.Router({ mergeParams: true }); // 메모리 ID를 라우터에 전달

// 댓글 등록
router.post('/:postId/comments', createComment); //200

// 댓글 수정
router.put('/:commentId', updateComment); //200

// 댓글 삭제
router.delete('/:commentId', deleteComment); //200

// 댓글 목록 조회
router.get('/:posts/postId/comments', getCommentsByPost); //200

module.exports = router;
