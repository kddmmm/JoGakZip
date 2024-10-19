const Group = require('../models/Group');
const bcrypt = require('bcryptjs');
const Badge = require('../models/Badge');
//그룹 생성
const createGroup = async(req, res) => {
    // 요청 양식 오류
    const { name, password, imageUrl, isPublic, introduction } = req.body;
    if(!name || !password || !imageUrl || typeof isPublic !== 'boolean' || !introduction) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }
    // 등록 성공
    const hashedPassword = await bcrypt.hash(password, 10);
    const newGroup = new Group({ name, password: hashedPassword, imageUrl, isPublic, introduction });
    const badges = new Badge({ groupId: newGroup._id, badges: [] });
    await newGroup.save()
        .then(() => res.status(201).send('그룹이 성공적으로 저장되었습니다.'))
        .catch(err => {
            console.error('저장 오류:', err);
            res.status(400).send('저장 오류: ' + err.message);
        });
    return res.status(201).json({newGroup});
};

//그룹 수정
const updateGroup = async(req, res) => {
    //요청 양식 오류
    const groupId = req.params.groupId;
    const { name, password, imageUrl, isPublic, introduction } = req.body;
    const group = await Group.findById(groupId);
    if(!name || !password || !imageUrl || typeof isPublic !== 'boolean' || !introduction) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    //비밀번호 오류
    const isPasswordValid = await bcrypt.compare(password, group.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    //Not Found
    if (!group){
        return res.status(404).json({ message: "존재하지 않습니다" })
    }
    
    //등록 성공
    group.name = name;
    group.imageUrl = imageUrl;
    group.isPublic = isPublic;
    group.introduction = introduction;
    await group.save();

    return res.status(200).json(group);
};

//그룹 목록 조회
const getGroup = async(req, res) => {
    const { page = 1, pageSize = 10, sortBy, keyword, isPublic } = req.query;

    // 페이지네이션 설정
    const options = {
        page: parseInt(page),
        limit: parseInt(pageSize),
    };

    // 기본 쿼리
    let query = {};
    
    // 공개 여부 필터링
    if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true'; // boolean으로 변환
    }

    // 검색어 필터링
    if (keyword) {
        query.name = { $regex: keyword, $options: 'i' }; // 대소문자 구분 없이 검색
    }

    // 정렬 옵션 설정
    let sortOptions = {};
    if (sortBy === 'latest') {
        sortOptions.createdAt = -1; // 최신순
    } else if (sortBy === 'mostPosted') {
        sortOptions.postCount = -1; // 게시글 많은순
    } else if (sortBy === 'mostLiked') {
        sortOptions.likeCount = -1; // 공감순
    } else if (sortBy === 'mostBadge') {
        sortOptions.badgeCount = -1; // 획득 배지순
    }

    // 그룹 목록 조회
    const groups = await Group.find(query)
        .sort(sortOptions)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

    // 전체 아이템 수 계산
    const totalItemCount = await Group.countDocuments(query);
    const totalPages = Math.ceil(totalItemCount / options.limit);

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        currentPage: options.page,
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: groups.map(group => ({
            id: group._id,
            name: group.name,
            imageUrl: group.imageUrl,
            isPublic: group.isPublic,
            likeCount: group.likeCount,
            badgeCount: group.badgeCount,
            postCount: group.memoryCount,
            createdAt: group.createdAt,
            introduction: group.introduction,
        })),
    });
};

//그룹 삭제
const deleteGroup = async(req, res) => {
    const groupId = req.params.groupId; // 그룹 ID 가져오기
    const { password } = req.body; // 본문에서 비밀번호 가져오기

    if (!groupId || groupId.length !== 24) {
        return res.status(400).json({ message: '유효하지 않은 그룹 ID입니다.' });
    }

    // 그룹 조회
    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: '존재하지 않는 그룹입니다' });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, group.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 그룹 삭제
    await group.deleteOne();
    return res.status(204).send();
};

//그룹 상세 정보 조희
const getGroupById = async(req, res) => {
    const groupId = req.params.groupId;
    const { password } = req.query;

    // 그룹 ID가 유효한지 확인
    if (!groupId) {
        return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: '존재하지 않는 그룹입니다' });
    }

    // 비공개 그룹일 경우 비밀번호 확인
    if (!group.isPublic && password) {
        const isPasswordValid = await bcrypt.compare(password, group.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
        }
    }

    // 응답 형식에 맞게 데이터 반환
    return res.status(200).json({
        id: group._id,
        name: group.name,
        imageUrl: group.imageUrl,
        isPublic: group.isPublic,
        likeCount: group.likeCount,
        badges: group.badges || [], // 배지가 없는 경우 빈 배열 반환
        postCount: group.memoryCount, // 메모리 수로 변경
        createdAt: group.createdAt,
        introduction: group.introduction,
    });
};

//그룹 조회 권한 확인
const checkGroupAccess = async(req, res) => {
    const groupId = req.params.groupId; // 그룹 ID 가져오기
    const { password } = req.body; // 본문에서 비밀번호 가져오기

    if (!groupId || groupId.length !== 24) {
        return res.status(400).json({ message: '유효하지 않은 그룹 ID입니다.' });
    }

    // 그룹 조회
    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: '존재하지 않는 그룹입니다.' });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, group.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 권한 확인 성공
    return res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    
};

//그룹 공감하기
const likeGroup = async(req, res) => {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: '존재하지 않습니다' });
    }

    group.likeCount += 1;
    await group.save();

    return res.status(200).json({ message: '그룹 공감하기 성공' });
};

//그룹 공개 여부 확인
const isGroupPublic = (req, res) => {
    const { isPublic } = req.body;
    if(isPublic == true){
        res.status(202).json(isPublic);
    }
};

module.exports = { createGroup, updateGroup, deleteGroup, getGroup, getGroupById, checkGroupAccess, likeGroup, isGroupPublic };