const Auth = require('../models/Auth');
const Admin = require('../models/Admin');
const Feed = require('../models/Feed');

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

    let result = await DB.insertValuesIntoTable('topics', { name });

    if (!result) throw new Error('Error while adding topic');

    return true;
}

async function addSubTopic(parent, { name, topicId }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let result = await DB.insertValuesIntoTable('subtopics', { name, topic_id: topicId });

    if (!result) throw new Error('Error while adding a subtopic');

    return true;
}

async function approvePost(parent, { postId, subTopicId }, { req }) {
    if (!Auth.isAdminAuthorised(req)) throw new Auth.AdminAuthenticationError();

    let result = await DB.insertValuesIntoTable('approved_posts', { post_id: postId, subtopic_id: subTopicId });

    if (!result) throw new Error('Error while approving post');

    //TODO: add point calculations
    //TODO: get all related posts for subtopic and their users. Then start comparing
    //TODO: get all users related to topic
    //TODO: for loop through subtopics and give points accortdingly to users
    //TODO: for loop through topics users and give 1 point each

    //TODO: send notification to user about approval and total score from it

    return true;
}

module.exports = { pedningPosts, allTopics, addTopic, addSubTopic, approvePost }