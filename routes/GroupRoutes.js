const express = require('express');
const { createGroup, getGroup, updateGroup, deleteGroup, getGroupById, checkGroupAccess, likeGroup, isGroupPublic } = require('../controllers/GroupController');
const { createPost, getPostByGroup } = require('../controllers/PostController');
const router = express();

router.post('/', createGroup); //200
router.get('/', getGroup); //200
router.put('/:groupId', updateGroup); //200
router.delete('/:groupId', deleteGroup); //200
router.get('/:groupId', getGroupById); //200
router.post('/:groupId/verify-password', checkGroupAccess); //200
router.post('/:groupId/like', likeGroup); //200
router.get('/:groupId/is-public', isGroupPublic); //200
router.post('/:groupId/posts', createPost); //200
router.get('/:groupId/posts', getPostByGroup); //200
module.exports = router;