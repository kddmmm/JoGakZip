// controllers/ImageController.js
const Image = require('../models/Image'); // 이미지 모델 가져오기
const path = require('path');

// 이미지 URL 생성
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; // 이미지 URL 생성

    // 데이터베이스에 이미지 정보 저장
    const newImage = new Image({
        filename: req.file.filename,
        url: imageUrl
    });

    try {
        await newImage.save(); // 이미지 정보 저장
        return res.status(200).json({ imageUrl }); // 성공 응답
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류' });
    }
};

module.exports = { uploadImage };
