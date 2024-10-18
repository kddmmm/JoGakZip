const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    introduction: {type: String},
    isPublic: {type: Boolean, default: true},
    imageUrl: {type: String},
    createAt: {type: Date, default: Date.now()},
    badges: {type: [String], default: []},
    likeCount: {type: Number, default: 0},
    postCount: {type: Number, default: 0},
});

module.exports = mongoose.model('Group', groupSchema);