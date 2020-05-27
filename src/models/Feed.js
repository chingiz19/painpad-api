async function getUserFeed(firstPersonId, { userId, topicId, postId }, count = 20, lastDate) {
    let whereStr = '';
    let whereArr = [];
    let counter = 1;
    let params = [];

    if (lastDate) {
        whereArr.push(`WHERE (extract(epoch from COALESCE(ap.approved, posts.created)) * 1000)  > $${counter}`);
        params.push(lastDate);
        counter++;
    }

    if (userId) {
        whereArr.push(`posts.user_id=$${counter}`);
        params.push(userId);
        counter++;
    }

    if (topicId) {
        whereArr.push(`topics.id=$${counter}`);
        params.push(topicId);
        counter++;
    }

    if (postId) {
        whereArr.push(`posts.id=$${counter}`);
        params.push(postId);
        counter++;
    }

    if (whereArr.length > 0) whereStr = `WHERE ${whereArr.join(' AND ')}`;

    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'description', posts.description,
            'created', extract(epoch from posts.created) * 1000,
            'industry', INITCAP(industries.name),
            'approved', extract(epoch from ap.approved) * 1000,
            'subTopic', json_build_object('id', subtopics.id, 'description', subtopics.name, 'topicId', topics.id, 'topicName', INITCAP(topics.name)),
            'location',  json_build_object('cityId', cities.id, 'cityName', cities.name, 'stateId', states.id, 'stateName', states.name, 
                                            'countryId', countries.id, 'countryName', countries.short_name),
            'sameHere', COALESCE(sh.count, 0),
            'sameHered', COALESCE(sh.same_hered, FALSE),
            'postedBy', users.obj
        ) ORDER BY posts.created DESC) AS posts
    FROM posts
    INNER JOIN approved_posts AS ap ON ap.post_id = posts.id
    INNER JOIN subtopics ON subtopics.id = subtopic_id
    INNER JOIN topics ON topics.id = subtopics.topic_id
    INNER JOIN industries ON industry_id = industries.id
    INNER JOIN cities ON city_id = cities.id
    INNER JOIN states ON states.id = cities.state_id
    INNER JOIN countries ON countries.id = states.country_id
    LEFT JOIN (SELECT post_id, count(user_id), ${firstPersonId}=ANY(array_agg(user_id)) AS same_hered FROM same_heres GROUP BY post_id) AS sh ON sh.post_id = ap.post_id
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
    LIMIT ${count};`;

    let result = await DB.incubate(query, params);

    if (!result) return false;

    return result[0].posts || [];
}

async function getPendingPosts(userId) {
    let whereStr = '';
    let counter = 1;
    let params = [];

    if (userId) {
        whereStr = `AND posts.user_id=$${counter}`;
        params.push(userId);
        counter++;
    }

    let query = `
    SELECT 
        json_agg(json_build_object(
            'id', posts.id,
            'description', posts.description,
            'created', extract(epoch from posts.created) * 1000,
            'industry', INITCAP(industries.name),
            'location', cities.name || ', ' || countries.short_name,
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
    INNER JOIN industries ON industry_id = industries.id) AS users ON users.id = posts.user_id
    WHERE approved IS NULL ${whereStr};`;

    let result = await DB.incubate(query, params);

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

async function getNotifications(userId) {
    let query = `
    SELECT 
        notifications.id, notifications.header, notifications.subheader, 
        notifications.description, notifications.action, notifications.icon,
        COALESCE(p.description, rp.description) AS "postText",
        extract(epoch from notifications.created) * 1000 AS created, 
        extract(epoch from notifications.seen) * 1000 AS seen,
        json_build_object( 'id', nt.id,
        'backgroundColor', nt.background_color,
        'color', nt.color,
        'icon', nt.icon,
        'isUserIcon', nt.is_user_icon,
        'description', nt.description ) AS type
    FROM notifications
    INNER JOIN notification_types AS nt ON nt.id = notifications.type_id
    LEFT JOIN posts AS p ON p.id = notifications.post_id
    LEFT JOIN rejected_posts AS rp ON rp.id = notifications.post_id
    WHERE notifications.user_id = ${userId}
    ORDER BY created DESC;`;

    return await DB.incubate(query, [postId]);
}

async function getNewNotificationCount(userId) {
    let result = await DB.selectFromWhere('notifications', ['COUNT(id)'], [DB.whereObj('user_id', '=', userId), DB.whereObj('seen', 'IS', 'NULL', true)]);

    if (!result) return false;

    return result[0].count || 0
}

module.exports = { getUserFeed, sameHereUsers, getPendingPosts, getNewNotificationCount, getNotifications }