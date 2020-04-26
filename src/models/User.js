const DB = require('./Database');

async function getUserInformation(userId) {
    let query = `
    SELECT json_build_object(
            'id', users.id,
            'firstName', initCap(first_name), 
            'lastName', initCap(last_name),
            'email', email,
            'emailVerified', email_verified,
            'score', score,
            'profilePic', profile_pic,
            'occupation', occupations.name,
            'industry', industries.name,
            'location', cities.name || ', ' || countries.name,
            'since',  extract(epoch from since) * 1000
        ) AS info
    FROM users
    LEFT JOIN occupations ON occupation_id = occupations.id
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON state_id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    WHERE users.id=${userId};`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].info || [];
}

async function getUserPosts(userId) {
    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'description', posts.description,
            'created', extract(epoch from posts.created) * 1000,
            'industry', industries.name,
            'approved', extract(epoch from posts.approved) * 1000,
            'subTopic', json_build_object('id', subtopics.id, 'description', subtopics.name, 'topicId', topics.id),
            'location', cities.name || ', ' || countries.name
        )) AS posts
    FROM posts
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    INNER JOIN subtopics ON subtopics.id = subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    WHERE user_id=${userId};`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].posts || [];
}

module.exports = { getUserInformation, getUserPosts }