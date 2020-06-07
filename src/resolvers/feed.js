const Subscriptions = require('../models/Subscriptions');
const Feed = require('../models/Feed');
const User = require('../models/User');
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

async function posts(parent, { userId, topicId, postId, lastDate, count }, { req }) {
    let firstPersonId = (req.session.user && req.session.user.id) || 0;

    let result = await Feed.getUserFeed(firstPersonId, { userId, topicId, postId, lastDate, count});

    if (!result) throw new Error('Error while getting news feed');

    return result;
}

async function getRejectedPost(parent, { rejectedPostId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user && req.session.user.id;

    let result = await Feed.getUserRejectedPost(userId, rejectedPostId);

    if (!result) throw new Error('Error while getting rejected post');

    return result;
}

async function sameHere(parent, { postId, add }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const tableName = 'same_heres';

    let result;
    let userId = req.session.user.id;

    if (add) {
        result = await DB.insertValuesIntoTable(tableName, { user_id: userId, post_id: postId });

        const userResult = await User.getQuickInfo(userId);

        if (!userResult) throw new Error('Error while implementing an action');

        const postUserResult = await DB.selectFromWhere('posts', [`user_id`], postId);

        if (!postUserResult) throw new Error('Error while implementing an action');

        const userName = userResult.name;
        const userProfilePic = userResult.profilePic;
        const userIndustry = userResult.industry;
        const postUserId = postUserResult[0].user_id;

        if (postUserId !== userId) {
            User.incrementScore(postUserId);

            //TODO: check for recent activity

            let notificationData = {
                header: 'New Same-here',
                subheader: userName,
                description: `From <span>${userIndustry}<span> just agreed with your post`,
                postId: postId,
                action: `/posts/${postId}`,
                icon: userProfilePic,
                typeId: 2
            }

            Subscriptions.notify(postUserId, notificationData);
        }
    } else {
        let where = [];

        where.push(DB.whereObj('user_id', '=', userId));
        where.push(DB.whereObj('post_id', '=', postId));

        result = await DB.deleteFromWhere(tableName, where);
    }

    if (!result) throw new Error('Error while implementing an action');

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
    const userId = req.session.user.id;

    let select = await DB.selectFromWhere(table, ['user_id'], postId);

    if (!select) throw new Error('Post does not exist');

    if (select[0].user_id !== userId) throw new Error(`User can not delete other people's posts`);

    let deleteApproved = await DB.deleteFromWhere('approved_posts', [DB.whereObj('post_id', '=', postId)]);

    if (!deleteApproved) console.log('Deleting post -> approved_posts is empty');

    let deleteSameHere = await DB.deleteFromWhere('same_heres', [DB.whereObj('post_id', '=', postId)]);

    if (!deleteSameHere) console.log('Deleting post -> same_heres is empty');

    let result = await DB.deleteFromWhere(table, postId);

    if (!result) throw new Error('Error while removing post');

    return true;
}

async function newNotificationCount(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const userId = req.session.user.id;

    const newCount = await Feed.getNewNotificationCount(userId);

    if (!newCount) throw new Error('Unexpected error while getting notifications count');

    return newCount;
}

async function notifications(parent, { limit }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const userId = req.session.user.id;

    const result = await Feed.getNotifications(userId);

    if (!result) throw new Error('Unexpected error while getting notifications from DB');

    const update = await DB.updateValuesInTable('notifications', [DB.whereObj('seen', 'IS', 'NULL', true)], { seen: 'now()' }, { rowCount: -1 });

    if (!update) throw new Error('Unexpected error while getting notifications from DB');

    return result;
}

module.exports = { post, posts, pendingPosts, sameHereUsers, sameHere, removePost, notifications, newNotificationCount, getRejectedPost }