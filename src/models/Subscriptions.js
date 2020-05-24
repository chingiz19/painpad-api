const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();


const SUBCRIPTION_CHANNELS = {
    NOTIFICATION_COUNT: 'HVl3SHgqqH',
    NEW_POST: 'TCCCqmg6Rg'
}

function subscribe(userId, type) {
    const channel = type + userId;

    setTimeout(() => notify(1, { description: 'Some random description' }), 3000);

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

    const countResult = await DB.selectFromWhere(table, ['COUNT(id)'], [DB.whereObj('user_id', '=', userId), DB.whereObj('seen', 'IS', 'NULL', true)]);

    if (!countResult) return console.error('Error while retrieving the notification count');

    return pubsub.publish(channel, { notificationCount: countResult[0].count });
}

async function newPost(userId, post) {
    const channel = SUBCRIPTION_CHANNELS.NEW_POST + userId;

    return pubsub.publish(channel, { post })
}

module.exports = { subscribe, notify, newPost, SUBCRIPTION_CHANNELS }