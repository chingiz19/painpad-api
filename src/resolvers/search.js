const Auth = require('../models/Auth');
const Search = require('../models/Search');

async function search(parent, { text }, { req }) {
    let result = {};

    let userId = req.session.user && req.session.user.id;
    let totCount = 0;
    let result_TopicPosts = [];
    let result_locationPosts = [];

    let result_Users = await Search.searchUsers(text, 7);

    if (!result_Users) throw new Error('Error while geeting search results for users');

    totCount = result_Users.length;

    if (userId) {
        result_TopicPosts = await Search.searchPosts(userId, text, null, (7 + 5) - totCount);

        if (!result_TopicPosts) throw new Error('Error while geeting search results for topic');

        totCount = totCount + result_TopicPosts.length;

        result_locationPosts = await Search.searchPosts(userId, null, text, 15 - totCount);

        if (!result_locationPosts) throw new Error('Error while geeting search results for country');
    }

    return result = {
        users: result_Users,
        topicPosts: result_TopicPosts,
        locationPosts: result_locationPosts 
    };
}


module.exports = { search }