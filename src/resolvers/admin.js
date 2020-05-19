const Auth = require('../models/Auth');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Feed = require('../models/Feed');

const MATCH_SCORES = {
    OCCUPATION: 10,
    USER_INDUSTRY: 4,
    POST_INDUSTRY: 3,
    CITY: 3,
    STATE: 2,
    COUNTRY: 1
}

async function pedningPosts(parent, args, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let result = await Feed.getPendingPosts();

    if (!result) throw new Error('Error while getting pending posts');

    return result;
}

async function allTopics(parent, args, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let result = await Admin.getAllTopics();

    if (!result) throw new Error('Error while getting all topics');

    return result;
}

async function addTopic(parent, { name }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let select = await DB.selectFromWhere('topics', ['id'], [DB.whereObj('name', '=', name)]);

    if (select) throw new Error('Given topic already exists');

    let result = await DB.insertValuesIntoTable('topics', { name });

    if (!result) throw new Error('Error while adding topic');

    return result.id;
}

async function addSubTopic(parent, { name, topicId }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let whereObj = [DB.whereObj('name', '=', name), DB.whereObj('topic_id', '=', topicId)];

    let select = await DB.selectFromWhere('subtopics', ['id'], whereObj);

    if (select) throw new Error('Given subtopic for a given topic id already exists');

    let result = await DB.insertValuesIntoTable('subtopics', { name, topic_id: topicId });

    if (!result) throw new Error('Error while adding a subtopic');

    return result.id;
}

async function approvePost(parent, { postId, subTopicId }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    const APPROVE_ERROR_MESSAGE = 'Error while approving post';

    let currentUser = await Admin.getPostUser(postId);

    if (!currentUser) throw new Error(APPROVE_ERROR_MESSAGE);

    let postUserTotalScore = 1;
    const currentUserId = currentUser.id;
    const currentOccupationId = currentUser.occupation;
    const currentIndustryId = currentUser.industry;
    const currentCityId = currentUser.city;
    const currentStateId = currentUser.state;
    const currentCountryId = currentUser.country;

    let subTopicPosts = await Admin.getSubTopicPosts(subTopicId);

    if (!subTopicPosts) throw new Error(APPROVE_ERROR_MESSAGE);

    for (const post of subTopicPosts) {
        const postUserId = post.user.id;

        const postUserOccupationId = post.user.occupationId;
        const postUserIndustryId = post.user.industryId;
        const postIndustryId = post.industryId;
        const postCityId = post.cityId;
        const postStateId = post.stateId;
        const postCountryId = post.countryId;

        if (currentOccupationId && postUserOccupationId && currentOccupationId === postUserOccupationId) {
            postUserTotalScore += MATCH_SCORES.OCCUPATION;
            User.incrementScore(postUserId, MATCH_SCORES.OCCUPATION);
        }

        if (currentIndustryId === postUserIndustryId) {
            postUserTotalScore += MATCH_SCORES.USER_INDUSTRY;
            User.incrementScore(postUserId, MATCH_SCORES.USER_INDUSTRY);
        }

        if (currentIndustryId === postIndustryId) {
            postUserTotalScore += MATCH_SCORES.POST_INDUSTRY;
            User.incrementScore(postUserId, MATCH_SCORES.POST_INDUSTRY);
        }

        if (currentCityId === postCityId) {
            postUserTotalScore += MATCH_SCORES.CITY;
            User.incrementScore(postUserId, MATCH_SCORES.CITY);
        }

        if (currentStateId === postStateId) {
            postUserTotalScore += MATCH_SCORES.STATE;
            User.incrementScore(postUserId, MATCH_SCORES.STATE);
        }

        if (currentCountryId === postCountryId) {
            postUserTotalScore += MATCH_SCORES.COUNTRY;
            User.incrementScore(postUserId, MATCH_SCORES.COUNTRY);
        }
    }

    //if other posts exist
    if (subTopicPosts.length > 0) {
        let topicUsers = await Admin.getTopicUsers(subTopicPosts[0].topicId);

        if (!topicUsers) throw new Error(APPROVE_ERROR_MESSAGE);

        for (const { userId } of topicUsers) User.incrementScore(userId);
    }

    let result = await DB.insertValuesIntoTable('approved_posts', { post_id: postId, subtopic_id: subTopicId });

    if (!result) throw new Error(APPROVE_ERROR_MESSAGE);

    User.incrementScore(currentUserId, postUserTotalScore);

    //TODO: send push notification about being approved and total score
    //TODO: send email notification about being approved and total score

    return true;
}

async function getRejectReasons(parent, args, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let result = await DB.selectFrom('reject_reasons', ['id', 'description AS value']);

    if (!result) throw new Error('Error while getting reject reasons');

    return result;
}

async function addRejectReason(parent, { reason }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let select = await DB.selectFromWhere('reject_reasons', ['id'], [DB.whereObj('description', '=', reason)]);

    if (select) throw new Error('Given reason already exists');

    let result = await DB.insertValuesIntoTable('reject_reasons', { description: reason });

    if (!result) throw new Error('Error inserting into a table');

    return result.id;
}

async function rejectPost(parent, { postId, reasonId, explanation, suggestion }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let select = await DB.selectFromWhere('reject_reasons', ['id'], reasonId);

    if (select) throw new Error('Given reason does not exist');

    let selectPost = await DB.selectFromWhere('posts', ['description', 'city_id', 'industry_id', 'created'], postId);

    if (!selectPost) throw new Error('Post does not exist');

    let insertObj = {
        rejected_by: req.session.user.id,
        description: selectPost[0].description,
        city_id: selectPost[0].city_id,
        industry_id: selectPost[0].industry_id,
        created: selectPost[0].created,
        reason_id: reasonId,
        explanation?, suggestion?
    }

    let insertPost = await DB.insertValuesIntoTable('rejected_posts', insertObj);

    if (!insertPost) throw new Error('Error inserting into a table');

    let deletePost = await DB.deleteFromWhere('posts', postId);

    if (!deletePost) throw new Error('Error while deleting post from table');

    //TODO: send push notification to user
    //TODO: send email notification to user

    return true;
}

module.exports = { pedningPosts, allTopics, addTopic, addSubTopic, approvePost, getRejectReasons, addRejectReason, rejectPost }