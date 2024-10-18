const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    badges: { type: [String], default: [] }, // 획득한 배지 목록
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Badge', badgeSchema);
