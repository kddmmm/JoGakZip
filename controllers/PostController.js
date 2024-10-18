const Post = require('../models/Post');
const Group = require('../models/Group');
const Comment = require('../models/Comment');
const bcrypt = require('bcryptjs');
const { checkBadges } = require('./BadgeController');


// 게시글 등록
const createPost = async (req, res) => {
    const { nickname, title, content, postPassword, groupPassword, imageUrl, tags, location, moment, isPublic } = req.body;
    const { groupId } = req.params;

    // 요청 데이터 유효성 검사
    if (!nickname || !title || !content || !postPassword || !groupPassword || !imageUrl || !moment || !groupId) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 게시글 비밀번호 해시화
    const hashedPostPassword = await bcrypt.hash(postPassword, 10);

    // 새로운 게시글 생성
    const newPost = new Post({
        nickname,
        title,
        content,
        password: hashedPostPassword,
        imageUrl,
        tags,
        location,
        moment,
        isPublic,
        groupId,
    });

    await newPost.save();

    // 그룹의 게시글 수 업데이트
    const group = await Group.findById(groupId);
    group.postCount += 1;
    await group.save();

    // 댓글 수 계산
    const commentCount = await Comment.countDocuments({ postId: newPost._id });

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        id: newPost._id,
        groupId: groupId,
        nickname: newPost.nickname,
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        tags: newPost.tags,
        location: newPost.location,
        moment: newPost.moment,
        isPublic: newPost.isPublic,
        likeCount: newPost.likes || 0,
        commentCount: commentCount,
        createdAt: newPost.createdAt,
    });
};

const updatePost = async (req, res) => {
    const { postId } = req.params; // URL 파라미터에서 postId 추출
    const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body; // 요청 본문에서 데이터 추출

    try {
        // 게시글 조회
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        // 비밀번호 확인
        const passwordMatch = await bcrypt.compare(postPassword, post.password);
        if (!passwordMatch) {
            return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
        }

        // 게시글 수정
        post.nickname = nickname || post.nickname; // 기존 값을 유지
        post.title = title || post.title;
        post.content = content || post.content;
        post.imageUrl = imageUrl || post.imageUrl;
        post.tags = tags || post.tags;
        post.location = location || post.location;
        post.moment = moment || post.moment;
        post.isPublic = isPublic !== undefined ? isPublic : post.isPublic; // 공개 여부 설정

        await post.save(); // 수정된 게시글 저장

        // 성공적인 응답 반환
        return res.status(200).json({
            id: post._id,
            groupId: post.groupId,
            nickname: post.nickname,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            tags: post.tags,
            location: post.location,
            moment: post.moment,
            isPublic: post.isPublic,
            likeCount: post.likes,
            commentCount: post.comments,
            createdAt: post.createdAt,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류' });
    }
};

// 게시글 삭제
const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const { postPassword } = req.body;
    // 요청 데이터 유효성 검사
    if (!postPassword) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: '존재하지 않습니다' });
    }

    // 게시글 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(postPassword, post.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    await post.deleteOne();

    // 그룹의 게시글 수 업데이트
    const group = await Group.findById(post.groupId);
    group.postCount -= 1;
    await group.save();

    return res.status(200).json({ message: '게시글 삭제 성공' });
};

// 게시글 목록 조회
const getPostByGroup = async (req, res) => {
    const { groupId } = req.params; // URL 파라미터에서 groupId 추출
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic } = req.query;

    // 요청 데이터 유효성 검사
    if (!groupId) {
        return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    
    const query = { groupId }; // groupId로 필터링

    // 공개 여부 필터링
    if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true'; // 문자열을 boolean으로 변환
    }

    // 제목 검색
    if (keyword) {
        query.title = { $regex: keyword, $options: 'i' }; // 대소문자 구분 없이 검색
    }

    // 총 게시글 수 계산
    const totalItemCount = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 정렬 설정
    let sortOptions;
    if (sortBy === 'mostLiked') {
        sortOptions = { likes: -1 };
    } else if (sortBy === 'mostCommented') {
        sortOptions = { comments: -1 };
    } else {
        sortOptions = { createdAt: -1 }; // 최신순
    }

    // 게시글 목록 조회
    const posts = await Post.find(query)
        .sort(sortOptions)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    // 응답 반환
    return res.status(200).json({
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: posts.map(post => ({
            id: post._id,
            nickname: post.nickname,
            title: post.title,
            imageUrl: post.imageUrl,
            tags: post.tags,
            location: post.location,
            moment: post.moment,
            isPublic: post.isPublic,
            likeCount: post.likes || 0,
            commentCount: post.comments.length || 0,
            createdAt: post.createdAt,
        }))
    });
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
    const postId = req.params.postId;

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: '존재하지 않습니다' });
    }

    return res.status(200).json({
        id: post._id,
        nickname: post.nickname,
        title: post.title,
        imageUrl: post.imageUrl,
        content: post.content,
        tags: post.tags,
        location: post.location,
        moment: post.moment,
        isPublic: post.isPublic,
        likeCount: post.likes,
        commentCount: post.comments.length,
        createdAt: post.createdAt,
    });
};

// 게시글 비밀번호 확인
const checkPostAccess = async (req, res) => {
    const postId = req.params.postId;
    const { postPassword } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const isPasswordValid = await bcrypt.compare(postPassword, post.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
        }

        return res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } catch (error) {
        console.error(error);
    }
};

// 게시글 공감하기
const likePost = async (req, res) => {
    const postId = req.params.postId; // URL에서 게시글 ID 추출

    try {
        const post = await Post.findById(postId); // 게시글 찾기
        if (!post) {
            return res.status(404).json({ message: '존재하지 않습니다' }); // 게시글이 없을 경우
        }

        post.likeCount += 1

        await post.save(); // 변경 사항 저장

        return res.status(200).json({ message: '게시글 공감하기 성공' }); // 성공 응답
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류' }); // 서버 오류 처리
    }
};

// 게시글 공개 여부 확인
const isPostPublic = async (req, res) => {
    const postId = req.params.postId; // 게시글 ID 가져오기

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: '존재하지 않습니다' });
    }

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        id: post._id,
        isPublic: post.isPublic,
    });
};


module.exports = { createPost, updatePost, deletePost, getPostByGroup, getPostById, likePost, isPostPublic, checkPostAccess };