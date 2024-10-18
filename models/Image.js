const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    filename: { type: String, required: true }, // 파일 이름
    url: { type: String, required: true }, // 이미지 URL
    uploadedAt: { type: Date, default: Date.now } // 업로드 시간
});

module.exports = mongoose.model('Image', ImageSchema);
