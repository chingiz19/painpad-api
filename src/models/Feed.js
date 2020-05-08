async function getUserFeed(userId, lastDate) {
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
            'subTopic', json_build_object('id', subtopics.id, 'description', INITCAP(subtopics.name::text || ' ' || topics.name), 'topicId', topics.id, 'topicId', topics.id),
            'location', cities.name || ', ' || countries.name,
            'postedBy', users.obj
        ) ORDER BY COALESCE(ap.approved, posts.created)) AS posts
    FROM posts
    LEFT JOIN approved_posts AS ap ON ap.post_id = posts.id
    LEFT JOIN subtopics ON subtopics.id = subtopic_id
    LEFT JOIN topics ON topics.id = subtopics.topic_id
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
    ${whereStr};`;

    let result = await DB.incubate(query);

    if (!result) return false;

    return result[0].posts || [];
}

module.exports = { getUserFeed }