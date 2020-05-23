const Auth = require('../models/Auth');
const Topic = require('../models/Topic');

const WEIGHTS = {
    USER_POINTS_WEIGHT: 0.15,
    POST_COUNT_WEIGHT: 0.6,
    SAME_HERE_WEIGHT: 0.25,
}

async function getTopicStats(parent, { topicId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let stats = await Topic.subtopicStats(topicId);

    if (!stats) throw new Error('Error while retrieving topic stats');

    return {
        stats,
        weights: {
            postCountWeight: WEIGHTS.POST_COUNT_WEIGHT,
            userPointWeight: WEIGHTS.USER_POINTS_WEIGHT,
            sameHereWeight: WEIGHTS.SAME_HERE_WEIGHT
        }
    }
}

async function getTopicPosts(parent, { topicId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

   //TODO:
}

module.exports = { getTopicStats, getTopicPosts }