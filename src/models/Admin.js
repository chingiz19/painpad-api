async function getAllTopics() {
    let query = `
    SELECT topics.id, topics.name, json_agg(json_build_object(
        'id', sub.id,
        'description', sub.name,
        'topicId', topics.id,
        'topicName', topics.name )) AS subs
    FROM topics
    LEFT JOIN subtopics AS sub ON sub.topic_id = topics.id
    GROUP BY topics.id, topics.name;`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result || [];
}

async function getSubTopicPosts(subTopicId) {
    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'topicId', topics.id,
            'industryId', industries.id,
            'cityId', cities.id,
            'stateId', states.id,
            'countryId', countries.id,
            'user', users.obj
        ) ORDER BY posts.created DESC) AS posts
    FROM posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    INNER JOIN industries ON posts.industry_id = industries.id
    INNER JOIN cities ON posts.city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    INNER JOIN
    (SELECT
        users.id, json_build_object('id', users.id, 'industryId', industries.id, 'occupationId', occupations.id) AS obj
    FROM users
    LEFT JOIN occupations ON users.occupation_id = occupations.id
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = posts.user_id
    WHERE subtopics.id = $1;`;

    let result = await DB.incubate(query, [subTopicId]);

    if (!result) return false;

    return result[0].posts || [];
}

async function getPostUser(postId) {
    let query = `
    SELECT users.id, users.industry_id AS industry,
    cities.id AS city, users.occupation_id AS occupation,
    states.id AS state, countries.id AS country
    FROM users
    INNER JOIN posts ON users.id = posts.user_id
    INNER JOIN cities ON users.city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    WHERE posts.id = $1;`;

    let result = await DB.incubate(query, [postId]);

    if (!result) return false;

    return result[0] || {};
}

async function getTopicUsers(topicId) {
    let query = `
    SELECT json_agg(json_build_object('id', users.id)) AS users
    FROM users
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN posts ON users.id = posts.user_id
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    WHERE topics.id = $1;`;

    let result = await DB.incubate(query, [topicId]);

    if (!result) return false;

    return result[0].users || [];
}

async function getAdminAnalytics() {
    let query = `
    WITH CTE_USER AS(
        SELECT 1 AS id, COUNT(id) AS users_cnt
        FROM users
    ),
    CTE_posts AS(
        SELECT 1 AS id, COUNT(ID) AS posts_cnt
        FROM posts
    ),
    CTE_same_here AS(
        SELECT 1 AS id, COUNT(ID) AS same_here_cnt
        FROM same_heres
    ),
    CTE_PP AS(
        SELECT 1 AS id, COUNT(CASE WHEN ap.approved IS NULL THEN 1 END) AS pending_posts_cnt
        FROM posts
        LEFT JOIN approved_posts as ap
            ON ap.post_id = posts.id
    )
    
    SELECT json_build_object(
                'usersCnt', CTE_USER.users_cnt,
                'postsCnt', CTE_posts.posts_cnt,
                'sameHereCnt', CTE_same_here.same_here_cnt,
                'pendingPostsCnt', CTE_PP.pending_posts_cnt
        ) AS "adminAnalytics"
    FROM CTE_USER
    LEFT JOIN CTE_posts
        ON CTE_posts.id = CTE_USER.id
    LEFT JOIN CTE_same_here 
        ON CTE_same_here.id = CTE_posts.id
    LEFT JOIN CTE_PP
        ON CTE_PP.id = CTE_same_here.id`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].adminAnalytics|| {};
}

module.exports = { getAllTopics, getSubTopicPosts, getPostUser, getTopicUsers, getAdminAnalytics}