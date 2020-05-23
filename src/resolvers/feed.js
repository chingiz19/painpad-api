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

async function posts(parent, { userId, topicId, lastDate, count }, { req }) {
    let firstPersonId = (req.session.user && req.session.user.id) || 0;

    let result = await Feed.getUserFeed(firstPersonId, { userId, topicId }, count, lastDate);

    if (!result) throw new Error('Error while getting news feed');

    return result;
}

async function sameHere(parent, { postId, add }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const tableName = 'same_heres';

    let result;
    let sendNotification = false;
    let userId = req.session.user.id;

    if (add) {
        result = await DB.insertValuesIntoTable(tableName, { user_id: userId, post_id: postId });
        sendNotification = true;
    } else {
        let where = [];

        where.push(DB.whereObj('user_id', '=', userId));
        where.push(DB.whereObj('post_id', '=', postId));

        result = await DB.deleteFromWhere(tableName, where);
    }

    if (!result) throw new Error('Error while getting news feed');

    //TODO: send notification to user about same here

    return true;
}

async function sameHereUsers(parent, { postId }, { req }) {
    let result = await Feed.sameHereUsers(postId);

    if (!result) throw new Error('Error while getting same here users');

    return result;
}

async function pendingPosts(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let result = await Feed.getPendingPosts(userId);

    if (!result) throw new Error(GENERIC_ERRROR);

    return result;
}

async function removePost(parent, { postId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const table = 'posts';
    let userId = req.session.user.id;

    let select = await DB.selectFromWhere(table, ['user_id'], postId);

    if (!select) throw new Error('Post does not exist');

    if (select[0].user_id !== userId) throw new Error(`User can not delete other people's posts`);

    let deleteApproved = await DB.deleteFromWhere('approved_posts', [DB.whereObj('post_id', '=', postId)]);

    if (!deleteApproved) console.log('Deleting pending post', postId, 'for user', userId)

    let result = await DB.deleteFromWhere(table, postId);

    if (!result) throw new Error('Error while removing post');

    return true;
}

module.exports = { post, posts, pendingPosts, sameHereUsers, sameHere, removePost }