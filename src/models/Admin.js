
async function getAllTopics() {
    let query = `
    SELECT topics.id, topics.name, json_agg(json_build_object(
        'id', sub.id,
        'description', sub.name,
        'topicId', topics.id)) AS topics
    FROM topics
    INNER JOIN subtopics AS sub ON sub.topic_id = topics.id
    GROUP BY topics.id, topics.name;`;

    let result = await DB.incubate(query, [postId]);

    if (!result) return false;

    return result[0].topics || [];
}

module.exports = { getAllTopics }