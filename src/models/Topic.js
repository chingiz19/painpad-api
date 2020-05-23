async function subtopicStats(topicId) {
    let query = `
    SELECT json_build_object(
            'subTopicId', ap.subtopic_id,
            'subTopicName', subtopics.name,
            'sameHeres', COALESCE(SUM(post_same_heres.count), 0),
            'userPoints', SUM(users.score),
            'postCounts', COUNT(ap.id)) AS stats
    FROM public.posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN users ON users.id = posts.user_id
    INNER JOIN subtopics ON subtopics.id = ap.subtopic_id
    LEFT JOIN (SELECT count(user_id), post_id FROM public.same_heres GROUP BY post_id) AS post_same_heres
    ON post_same_heres.post_id = posts.id
    WHERE subtopics.topic_id = $1
    GROUP BY ap.subtopic_id, subtopics.name;`;

    let result = await DB.incubate(query, [topicId]);

    if (!result) return false;

    return result[0].stats || [];
}

module.exports = { subtopicStats }