const Auth = require('../models/Auth');
const Topic = require('../models/Topic');

const WEIGHTS = {
    subTopicWeights: {
        postCount: 0.6,
        userPoint: 0.15,
        sameHere: 0.25
    },
    countryWeights: {
        postCount: 0.6,
        sameHere: 0.4
    }
}

async function getTopicStats(parent, { topicId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let subTopicStats = await Topic.subTopicStats(topicId);

    if (!subTopicStats) throw new Error('Error while retrieving topic stats');

    let topicCountryStats = await Topic.topicCountryStats(topicId);

    if (!topicCountryStats) throw new Error('Error while retrieving topic stats');

    return {
        subTopicStats,
        topicCountryStats,
        weights : WEIGHTS
    }
}

module.exports = { getTopicStats }