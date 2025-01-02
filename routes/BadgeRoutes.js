const express = require('express');
const { checkBadges } = require('../controllers/BadgeController');

const router = express.Router();

// 특정 그룹의 배지 조회
router.get('/api/groups/:groupId/badges', async (req, res) => {
    const badges = await Badge.findOne({ groupId: req.params.groupId });
    return res.status(200).json(badges);
});

module.exports = router;
