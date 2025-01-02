const Comment = require('../models/Comment');
const post = require('../models/Post');
const bcrypt = require('bcryptjs');

// 댓글 등록
const createComment = async (req, res) => {
    const { postId } = req.params; // 메모리 ID
    const { nickname, content, password } = req.body;

    // 요청 데이터 유효성 검사
    if (!nickname || !content || !password) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 댓글 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    const newComment = new Comment({
        postId,
        nickname,
        content,
        password: hashedPassword,
    });

    await newComment.save();
    return res.status(201).json(newComment);
};

// 댓글 수정
const updateComment = async (req, res) => {
    const { postId, commentId } = req.params; // 메모리 ID와 댓글 ID 가져오기
    const { nickname, content, password } = req.body;

    // 요청 데이터 유효성 검사
    if (!nickname || !content || !password) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 댓글 찾기
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: '존재하지 않는 댓글입니다' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, comment.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 수정
    comment.content = content;
    comment.nickname = nickname; // 닉네임 수정 가능
    await comment.save();

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        id: comment._id,
        nickname: comment.nickname,
        content: comment.content,
        createdAt: comment.createdAt,
    });
};

// 댓글 삭제
const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params; // 메모리 ID와 댓글 ID 가져오기
    const { password } = req.body;

    // 요청 데이터 유효성 검사
    if (!password) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 댓글 찾기
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: '존재하지 않는 댓글입니다' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, comment.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 삭제
    await comment.deleteOne();

    return res.status(200).json({ message: '답글 삭제 성공' });
};

// 댓글 목록 조회
const getCommentsByPost = async (req, res) => {
    const { postId } = req.params; // 메모리 ID
    const { page = 1, pageSize = 10 } = req.query; // 페이지 번호 및 페이지당 아이템 수

    // 페이지네이션 설정
    const options = {
        page: parseInt(page),
        limit: parseInt(pageSize),
    };

    // 댓글 조회
    const comments = await Comment.find({ postId })
        .sort({ createdAt: -1 }) // 최신순으로 정렬
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

    // 전체 댓글 수 계산
    const totalItemCount = await Comment.countDocuments({ postId });
    const totalPages = Math.ceil(totalItemCount / options.limit);

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        currentPage: options.page,
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: comments.map(comment => ({
            id: comment._id,
            nickname: comment.nickname,
            content: comment.content,
            createdAt: comment.createdAt,
        })),
    });
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getCommentsByPost,
};
