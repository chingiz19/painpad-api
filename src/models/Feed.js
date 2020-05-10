async function getUserFeed(userId, count = 20, lastDate) {
    let whereStr = '';

    if (lastDate) whereStr = `WHERE (extract(epoch from COALESCE(ap.approved, posts.created)) * 1000)  > ${lastDate}`;

    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'description', posts.description,
            'created', extract(epoch from posts.created) * 1000,
            'industry', INITCAP(industries.name),
            'approved', extract(epoch from ap.approved) * 1000,
            'topic', json_build_object('id', topics.id, 'name', INITCAP(topics.name)),
            'location', cities.name || ', ' || countries.name,
            'sameHere', COALESCE(sh.count, 0),
            'postedBy', users.obj
        ) ORDER BY ap.approved DESC) AS posts
    FROM posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    LEFT JOIN (SELECT post_id, count(user_id) FROM same_heres GROUP BY post_id) AS sh ON sh.post_id = ap.id
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
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = ${userId || 'posts.user_id'} 
    ${whereStr}
    LIMIT ${count};`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].posts || [];
}

async function getPendingPosts(userId) {
    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'description', posts.description,
            'created', extract(epoch from posts.created) * 1000,
            'industry', INITCAP(industries.name),
            'location', cities.name || ', ' || countries.name,
            'postedBy', users.obj
        ) ORDER BY COALESCE(ap.approved, posts.created)) AS posts
    FROM posts
    LEFT JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
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
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = ${userId || 'posts.user_id'} 
    WHERE approved IS NULL;`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].posts || [];
}

async function sameHereUsers(postId) {
    let query = `
    SELECT json_agg(users.obj) AS users
    FROM same_heres AS sh
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
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = sh.user_id
    WHERE post_id = $1;`;

    let result = await DB.incubate(query, [postId]);

    if (!result) return false;

    return result[0].users || [];
}

module.exports = { getUserFeed, sameHereUsers, getPendingPosts }