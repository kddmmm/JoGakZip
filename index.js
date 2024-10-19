const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// 라우터 가져오기
const groupRoutes = require('./routes/GroupRoutes');
const postRoutes = require('./routes/PostRoutes');
const commentRoutes = require('./routes/CommentRoutes');
const badgeRoutes = require('./routes/BadgeRoutes');
const imageRoutes = require('./routes/ImageRoutes');

// 환경 변수 설정
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const uri = 'mongodb+srv://ehdals5387:MaDtZaA3kzR2BxDG@cluster0.ojoih7h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB 연결
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB 연결 성공!'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙 설정 (이미지 업로드 등)
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));


// 라우터 설정
app.use('/groups', groupRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/badges', badgeRoutes);
app.use('/images', imageRoutes);

// 기본 라우트 (테스트용)
app.get('/', (req, res) => {
    res.send('API가 정상적으로 작동하고 있습니다.');
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
