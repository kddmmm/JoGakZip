const mongoose = require('mongoose');

const commentSchema = ({
    nickname: {type: String, required: true},
    content: {type: String, required: true},
    password: {type: String, required: true},
    createAt: {type: Date, default: Date.now()},
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
});

module.exports = mongoose.model('Comment', commentSchema);