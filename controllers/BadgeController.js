const Badge = require('../models/Badge');
const Post = require('../models/Post');
const Group = require('../models/Group'); // 그룹 모델이 필요합니다

// 배지 조건 체크 및 업데이트
const checkBadges = async (groupId) => {
    const badges = await Badge.findOne({ groupId });
    
    if (!badges) {
        // 새 배지 문서 생성
        const badges = new Badge({ groupId, badges: [] });
        await badges.save();
    }

    const memories = await Post.find({ groupId });
    const postCount = memories.length;
    const totalLikes = memories.reduce((acc, post) => acc + post.likeCount, 0);
    const is7DaysContinuous = await check7DaysContinuousMemories(groupId); // 7일 연속 추억 등록 체크

    // 배지 조건 체크
    if (is7DaysContinuous && !badges.badges.includes('7일 연속 추억 등록')) {
        badges.badges.push('7일 연속 추억 등록');
    }
    
    if (postCount >= 20 && !badges.badges.includes('추억 수 20개 이상 등록')) {
        badges.badges.push('추억 수 20개 이상 등록');
    }
    
    if (await isGroupCreatedForOneYear(groupId) && !badges.badges.includes('그룹 생성 후 1년 달성')) {
        badges.badges.push('그룹 생성 후 1년 달성');
    }
    
    if (await isGroupSpaceExceeded(groupId) && !badges.badges.includes('그룹 공간 1만 개 이상 받기')) {
        badges.badges.push('그룹 공간 1만 개 이상 받기');
    }
    
    if (totalLikes >= 10000 && !badges.badges.includes('추억 공감 1만 개 이상 받기')) {
        badges.badges.push('추억 공감 1만 개 이상 받기');
    }

    // 공감 1만 개 이상의 추억이 하나라도 있으면 획득
    if (memories.some(post => post.likeCount >= 10000) && !badges.badges.includes('공감 1만 개 이상의 추억이 하나라도 획득')) {
        badges.badges.push('공감 1만 개 이상의 추억이 하나라도 획득');
    }

    await badges.save();
};

// 7일 연속 추억 등록 체크
const check7DaysContinuousMemories = async (groupId) => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentMemories = await Post.find({
        groupId,
        createdAt: { $gte: last7Days }
    });

    const uniqueDates = new Set(recentMemories.map(post => post.createdAt.toISOString().split('T')[0]));

    return uniqueDates.size >= 7; // 7일 이상 등록되었는지 확인
};

// 그룹 생성 후 1년 체크
const isGroupCreatedForOneYear = async (groupId) => {
    const group = await Group.findById(groupId);
    if (!group) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return group.createdAt <= oneYearAgo;
};

// 그룹 공간 1만 개 이상 체크
const isGroupSpaceExceeded = async (groupId) => {
    const group = await Group.findById(groupId);
    return group.spaceCount >= 10000; // 그룹의 공간 수가 1만 이상인지 확인
};

module.exports = { checkBadges };
