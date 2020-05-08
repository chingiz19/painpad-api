const Feed = require('../models/Feed');
const Auth = require('../models/Auth');

async function post(parent, { description, cityId, industryId }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    let userId = req.session.user.id;

    let data = {
        user_id: userId,
        city_id: cityId,
        industry_id: industryId,
        description
    }

    let result = await DB.insertValuesIntoTable('temp_posts', data)

    if (!result) throw new Error('Error while uploading post');

    return true;
}

module.exports = { post }