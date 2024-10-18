// routes/ImageRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage } = require('../controllers/ImageController'); // 컨트롤러 가져오기

const router = express.Router();

// multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 파일 저장 경로
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 고유한 파일 이름 생성
    }
});

const upload = multer({ storage: storage });

// 이미지 URL 생성 라우트
router.post('/upload', upload.single('image'), uploadImage); // 컨트롤러 사용

module.exports = router;
