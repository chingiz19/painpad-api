async function subTopicStats(topicId) {
    let query = `
    SELECT 	
        ap.subtopic_id AS "subTopicId", subtopics.name AS "subTopicName",
        COALESCE(SUM(post_same_heres.count), 0) AS "sameHereCount",
        SUM(users.score) AS "userPoints",
        COUNT(ap.id) AS "postCount"
    FROM public.posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN users ON users.id = posts.user_id
    INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
    LEFT JOIN (SELECT count(user_id), post_id FROM public.same_heres GROUP BY post_id) AS post_same_heres
    ON post_same_heres.post_id = posts.id
    WHERE subtopics.topic_id = $1
    GROUP BY ap.subtopic_id, subtopics.name;`;

    return await DB.incubate(query, [topicId]);
}

async function topicCountryStats(topicId) {
    let query = `
    SELECT countries.id AS "countryId", ISO_3_code.name AS "countryName", COUNT(posts.id) AS "postCount", COALESCE (same_heres.count, 0) AS "sameHereCount"
    FROM public.posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
    INNER JOIN cities ON posts.city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    INNER JOIN ISO_3_code ON ISO_3_code.id = countries.iso_3_code_id
    LEFT JOIN (
        SELECT countries.id AS country_id, COUNT(same_heres.user_id)
        FROM same_heres
        INNER JOIN posts ON posts.id = same_heres.post_id
        INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
        INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
        INNER JOIN users ON users.id = same_heres.user_id
        INNER JOIN cities ON posts.city_id = cities.id
        INNER JOIN states ON states.id = cities.state_id
        INNER JOIN countries ON countries.id = states.country_id
        WHERE subtopics.topic_id = $1
        GROUP BY 1) AS same_heres ON same_heres.country_id = countries.id
    WHERE subtopics.topic_id = $1
    GROUP BY 1, 2, 4;`;

    return await DB.incubate(query, [topicId]);
}

async function topicList() {
    let query = `
    WITH CTE_1 AS (
        SELECT json_agg(json_build_object(
            'value', id,
            'label', LOWER(name))
            ORDER BY LOWER(name)) AS topics
        FROM topics
        WHERE LOWER(name) NOT LIKE 'other'
    ),
    CTE_2 AS(
        SELECT json_agg(json_build_object(
            'value', id,
            'label', name)) AS topics
        FROM topics
        WHERE LOWER(name) LIKE 'other'
    )
    
    SELECT * FROM CTE_1
    UNION ALL
    SELECT * FROM CTE_2`;
    
    let result = await DB.incubate(query, []);

    return result[0].topics.concat(result[1].topics);
}

module.exports = { subTopicStats, topicCountryStats, topicList}