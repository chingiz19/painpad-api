const { PubSub } = require("graphql-subscriptions");
const Feed = require('../models/Feed');
const pubsub = new PubSub();

const SUBCRIPTION_CHANNELS = {
    NOTIFICATION_COUNT: 'HVl3SHgqqH',
    NEW_POST: 'TCCCqmg6Rg'
}

function subscribe(channel) {
    return pubsub.asyncIterator(channel);
}

/**
 * Notifies user by saving notification in the DB
 * and triggering subcription channel
 * 
 * @param {*} userId user ID
 * @param {*} data ->param  { description, action [optional] }
 */
async function notify(userId, { description, action }) {
    const channel = SUBCRIPTION_CHANNELS.NOTIFICATION_COUNT + userId;
    const table = 'notifications';

    const result = await DB.insertValuesIntoTable(table, { user_id: userId, description, action });

    if (!result) return console.error('Error while inserting into DB notifications count');

    const newCount = await Feed.getNewNotificationCount(userId);

    return pubsub.publish(channel, { newNotificationCount: newCount });
}

async function newPost(postId) {
    const postResult = await Feed.getUserFeed(0, { postId });

    if (!postResult) return console.error('Error while retrieving post info for publish (newPost subscription)');

    return pubsub.publish(SUBCRIPTION_CHANNELS.NEW_POST, { post: postResult[0] })
}

module.exports = { subscribe, notify, newPost, SUBCRIPTION_CHANNELS }