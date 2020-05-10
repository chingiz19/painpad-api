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

module.exports = { pedningPosts, allTopics }