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

async function sameHere(parent, { postId, add }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const tableName = 'same_heres';

    let result;
    let userId = req.session.user.id;

    if (add) {
        result = await DB.insertValuesIntoTable(tableName, { user_id: userId, post_id: postId });
    } else {
        let where = [];

        where.push(DB.whereObj('user_id', '=', userId));
        where.push(DB.whereObj('post_id', '=', postId));

        result = await DB.deleteFromWhere(tableName, where);
    }

    if (!result) throw new Error('Error while getting news feed');

    return true;
}

async function sameHereUsers(parent, { postId }, { req }) {
    let result = await Feed.getUserFeed(postId);

    if (!result) throw new Error('Error while getting same here users');

    return result;
}

async function pendingPosts(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let result = await Feed.getUserPendingPosts(userId);

    if (!result) throw new Error(GENERIC_ERRROR);

    return result;
}

module.exports = { post, userFeed, pendingPosts, sameHereUsers, sameHere }