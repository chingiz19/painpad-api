const { PubSub } = require("graphql-subscriptions");
const Feed = require('../models/Feed');
const pubsub = new PubSub();

const NOTIFICATION_COUNT_USER_REMINDER = 10;

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
async function notify(userId, { header, subheader, description, action, icon, typeId, postId }) {
    const channel = SUBCRIPTION_CHANNELS.NOTIFICATION_COUNT + userId;
    const table = 'notifications';

    const result = await DB.insertValuesIntoTable(table, { user_id: userId, type_id: typeId, post_id: postId, header, subheader, description, action, icon });

    if (!result) return console.error('Error while inserting into DB notifications @ Subscriptions.notify()');

    const newCount = await Feed.getNewNotificationCount(userId);

    if (!newCount) return console.error('Error while inserting into DB notifications count');

    if (newCount % NOTIFICATION_COUNT_USER_REMINDER) {
        //TODO: send email about accumulated notifications
    }

    return pubsub.publish(channel, { newNotificationCount: newCount });
}

async function newPost(postId) {
    const postResult = await Feed.getUserFeed(0, { postId });

    if (!postResult) return console.error('Error while retrieving post info for publish (newPost subscription)');

    return pubsub.publish(SUBCRIPTION_CHANNELS.NEW_POST, { post: postResult[0] })
}

module.exports = { subscribe, notify, newPost, SUBCRIPTION_CHANNELS }