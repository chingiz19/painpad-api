const Feed = require('../models/Feed');
const Auth = require('../models/Auth');

async function post(parent, { description, cityId, industryId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let data = {
        user_id: userId,
        city_id: cityId,
        industry_id: industryId,
        description
    }

    let result = await DB.insertValuesIntoTable('posts', data)

    if (!result) throw new Error('Error while uploading post');

    return true;
}

async function userFeed(parent, { lastDate, count }, { req }) {
    let result = await Feed.getUserFeed(null, count, lastDate)

    if (!result) throw new Error('Error while getting news feed');

    return result;
}

async function pendingPosts(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let result = await Feed.getUserPendingPosts(userId);

    if (!result) throw new Error(GENERIC_ERRROR);

    return result;
}

module.exports = { post, userFeed, pendingPosts }