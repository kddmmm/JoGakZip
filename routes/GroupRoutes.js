const express = require('express');
const { createGroup, getGroup, updateGroup, deleteGroup, getGroupById, checkGroupAccess, likeGroup, isGroupPublic } = require('../controllers/GroupController');
const { createPost, getPostByGroup } = require('../controllers/PostController');
const router = express();


// 그룹 생성
router.post('/api/groups', createGroup); //200

// 그룹 조회
router.get('/api/groups', getGroup); //200

// 그룹 수정
router.put('/api/groups/:groupId', updateGroup); //200

// 그룹 삭제
router.delete('/api/groups/:groupId', deleteGroup); //200

// 그룹 상세 조회
router.get('/api/groups/:groupId', getGroupById); //200

// 그룹 조회 권한 확인
router.post('/api/groups/:groupId/verify-password', checkGroupAccess); //200

// 그룹 공감하기 
router.post('/api/groups/:groupId/like', likeGroup); //200

// 그룹 공개 여부 확인
router.get('/api/groups/:groupId/is-public', isGroupPublic); //200

// 게시글 생성
router.post('/api/groups/:groupId/posts', createPost); //200

// 게시글 목록 조회
router.get('/api/groups/:groupId/posts', getPostByGroup); //200


module.exports = router;