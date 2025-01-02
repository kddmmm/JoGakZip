const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    tags: { type: [String] },
    location: { type: String },
    moment: { type: Date, required: true },
    isPublic: { type: Boolean, default: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likeCount: {type: Number, default: 0}
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);