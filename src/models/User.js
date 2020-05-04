const DB = require('./Database');

async function getUserInformation(userId) {
    let query = `
    SELECT json_build_object(
            'id', users.id,
            'firstName', INITCAP(first_name), 
            'lastName', INITCAP(last_name),
            'email', email,
            'emailVerified', email_verified,
            'score', score,
            'profilePic', profile_pic,
            'occupation', json_build_object('id', COALESCE(occupations.id, 0), 'value', COALESCE(occupations.name, 'Please select')),
            'industry', json_build_object('id', industries.id, 'value', industries.name),
            'location', json_build_object('id', cities.id, 'value', cities.name || ', ' || countries.name),
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
            'industry', INITCAP(industries.name),
            'approved', extract(epoch from posts.approved) * 1000,
            'subTopic', json_build_object('id', subtopics.id, 'description', INITCAP(subtopics.name::text), 'topicId', topics.id),
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

async function getUserStats(userId, whereColumn, column) {
    let query = `
    SELECT 
        json_agg(json_build_object('id', users.id,
                                'firstName', INITCAP(users.first_name),
                                'lastName', INITCAP(users.last_name),
                                'profilePic', users.profile_pic,
                                'industry', INITCAP(industries.name),
                                'occupation', INITCAP(occupations.name) 
                                ))
    FROM follows
    INNER JOIN users ON users.id=follows.${column}
    LEFT JOIN occupations ON users.occupation_id = occupations.id
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON state_id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    WHERE ${whereColumn}=${userId};`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].json_agg || [];
}

async function changeUserProfile(userId, args) {
    let updates = {};

    for (const [field, value] of Object.entries(args)) {
        switch (field) {
            case 'firstName':
                updates['first_name'] = value;
                break;
            case 'lastName':
                updates['last_name'] = value;
                break;
            case 'locationId':
                updates['location_id'] = value;
                break;
            case 'occupationId':
                updates['occupation_id'] = value;
                break;
            case 'industryId':
                updates['industry_id'] = value;
                break;
            case 'profilePic':
                updates['profile_pic'] = value;
                break;
            default:
                throw new Error('Unknown argument encountered');
        }
    }

    return await DB.updateValuesInTable('users', userId, updates);
}

module.exports = { getUserInformation, getUserPosts, getUserStats, changeUserProfile }