async function searchUsers(text, limit) {
    let params = [text];

    let query = `
    SELECT 
        users.id AS id,
        INITCAP(first_name) AS "firstName",
        INITCAP(last_name) AS "lastName",
        profile_pic AS "profilePic",
        industries.name AS industry,
        COALESCE(occupations.name, 'Please select') AS occupation
    FROM users
    LEFT JOIN industries 
        ON industries.id = users.industry_id
    LEFT JOIN occupations 
        ON occupations.id = users.occupation_id
    WHERE LOWER(users.first_name || ' ' || users.last_name) LIKE ('%' || $1 || '%')
    ORDER BY users.first_name
    LIMIT ${limit};`;

    return await DB.incubate(query, params);
}

async function searchPosts(userId, topic, location, limit) {
    let whereStr = '';
    let whereArr = [];
    let counter = 1;
    let params = [];

    if (topic) {
        whereArr.push(`LOWER(topics.name) LIKE ('%' || $${counter} || '%')`);
        params.push(topic);
        counter++;
    }

    if (location) {
        whereArr.push(`LOWER(cities.name || ' ' || countries.name) LIKE ('%' || $${counter} || '%')`);
        params.push(location);
        counter++;
    }

    if (whereArr.length > 0) whereStr = `WHERE ${whereArr.join(' AND ')}`;

    let query = `
    SELECT 
        posts.id, posts.description,
        extract(epoch from posts.created) * 1000 AS created,
        extract(epoch from ap.approved) * 1000 AS approved,
        json_build_object('id', subtopics.id, 'description', subtopics.name, 'topicId', topics.id, 'topicName', INITCAP(topics.name)) AS "subTopic",
        json_build_object('cityId', cities.id, 'cityName', cities.name, 'stateId', states.id, 'stateName', states.name, 
                                    'countryId', countries.id, 'countryName', ISO_3_code.name) AS location,
        COALESCE(sh.count, 0) AS "sameHere",
        COALESCE(sh.same_hered, FALSE) AS "sameHered",
        users.obj AS "postedBy" 
    FROM posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    INNER JOIN ISO_3_code ON ISO_3_code.id = countries.iso_3_code_id
    LEFT JOIN (SELECT post_id, count(user_id), ${userId}=ANY(array_agg(user_id)) AS same_hered FROM same_heres GROUP BY post_id) AS sh ON sh.post_id = ap.post_id
    INNER JOIN 
    (SELECT
        users.id,
        json_build_object('id', users.id,
                        'firstName', INITCAP(users.first_name),
                        'lastName', INITCAP(users.last_name),
                        'profilePic', users.profile_pic,
                        'industry', INITCAP(industries.name),
                        'occupation', INITCAP(occupations.name)) AS obj
    FROM users
    LEFT JOIN occupations ON users.occupation_id = occupations.id
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = posts.user_id
    ${whereStr}
    ORDER BY posts.created DESC
    LIMIT ${limit};`;

    return await DB.incubate(query, params);
}

module.exports = { searchUsers, searchPosts }