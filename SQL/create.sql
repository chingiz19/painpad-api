DROP TABLE IF EXISTS occupations, sectors, industry_groups, parent_industries, industries, users, regions, ISO_2_code, ISO_3_code, countries, states, 
cities, posts, approved_posts, topics, subtopics, follows, same_heres, reject_reasons,
rejected_posts, notification_types, notifications, activity_types, user_activities CASCADE;

CREATE TABLE occupations (
 id             SERIAL      PRIMARY KEY,
 name           TEXT        NOT NULL
);

CREATE TABLE sectors (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL
);

CREATE TABLE industry_groups (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    sector_id      INTEGER     REFERENCES sectors(id)
);

CREATE TABLE parent_industries (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    industry_group_id      INTEGER     REFERENCES industry_groups(id)
);

CREATE TABLE industries (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    definition     TEXT        NULL,
    parent_industry_id      INTEGER     REFERENCES parent_industries(id)
);

CREATE TABLE regions (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL
);

CREATE TABLE ISO_2_code (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL
);

CREATE TABLE ISO_3_code (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL
);

CREATE TABLE countries (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    iso_2_code_id      INTEGER     REFERENCES ISO_2_code(id),
    iso_3_code_id      INTEGER     REFERENCES ISO_3_code(id),
    region_id      INTEGER     REFERENCES regions(id)
);

CREATE TABLE states (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    country_id     INTEGER     REFERENCES countries(id)
);

CREATE TABLE cities (
    id             SERIAL      PRIMARY KEY,
    name           TEXT        NOT NULL,
    state_id       INTEGER     REFERENCES states(id)
);

CREATE TABLE users (
    id                 SERIAL                              PRIMARY KEY,
    first_name         TEXT                                NOT NULL,
    last_name          TEXT                                NOT NULL,
    email              TEXT                                NOT NULL    UNIQUE,
    password_hash      TEXT                                NOT NULL,
    score              INTEGER                             NOT NULL    DEFAULT 0,
    email_verified     BOOLEAN                             NOT NULL    DEFAULT FALSE,
    profile_pic        TEXT                                NOT NULL    DEFAULT 'https://painpad-profile-pictures.s3-us-west-1.amazonaws.com/painpad_default.jpg',
    p_level            INTEGER                             NOT NULL    DEFAULT 2,     
    occupation_id      INTEGER                             REFERENCES occupations(id),
    industry_id        INTEGER                             REFERENCES industries(id),
    since              TIMESTAMP WITHOUT TIME ZONE         NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    city_id            INTEGER                             REFERENCES cities(id)
);

CREATE TABLE topics (
    id         SERIAL      PRIMARY KEY,
    name       TEXT        NOT NULL    UNIQUE
);

CREATE TABLE subtopics (
    id         SERIAL      PRIMARY KEY,
    name       TEXT        NOT NULL,
    topic_id   INTEGER     REFERENCES topics(id)
);

CREATE TABLE posts (
    id             SERIAL                          PRIMARY KEY,
    description    TEXT                            NOT NULL    UNIQUE,
    city_id        INTEGER                         NOT NULL REFERENCES cities(id),
    topic_id       INTEGER                         NOT NULL REFERENCES topics(id),
    user_id        INTEGER                         REFERENCES users(id),
    created        TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approved_posts (
    id             SERIAL                          PRIMARY KEY,
    post_id        INTEGER                         NOT NULL    REFERENCES posts(id),
    approved       TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    subtopic_id    INTEGER                         REFERENCES subtopics(id)
);

CREATE TABLE reject_reasons (
    id             SERIAL  PRIMARY KEY,
    description    TEXT	NOT NULL    UNIQUE
);

CREATE TABLE rejected_posts (
    id             SERIAL                          PRIMARY KEY,
    description    TEXT                            NOT NULL    UNIQUE,
    city_id        INTEGER                         NOT NULL    REFERENCES cities(id),
    industry_id    INTEGER                         NOT NULL    REFERENCES industries(id),
    posted_by      INTEGER                         NOT NULL    REFERENCES users(id),
    created        TIMESTAMP WITHOUT TIME ZONE     NOT NULL,
    rejected       TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    rejected_by    INTEGER                         NOT NULL    REFERENCES users(id),
    reason_id      INTEGER                         NOT NULL    REFERENCES reject_reasons(id),
    explanation    TEXT,
    suggestion     TEXT
);

CREATE TABLE same_heres (
    id             SERIAL      PRIMARY KEY,
    user_id        INTEGER     REFERENCES users(id),
    post_id        INTEGER     REFERENCES posts(id)
);

CREATE TABLE follows (
    id         SERIAL      PRIMARY KEY,
    user_id    INTEGER     REFERENCES users(id),     
    follows    INTEGER     REFERENCES users(id)
);

CREATE TABLE solutions (
    id              SERIAL      PRIMARY KEY,
    post_id         INTEGER     REFERENCES posts(id),     
    user_id         INTEGER     REFERENCES users(id),
    logo            TEXT        NOT NULL    DEFAULT 'https://painpad-profile-pictures.s3-us-west-1.amazonaws.com/painpad_default.jpg',
    name            TEXT        NOT NULL,
    website         TEXT,
    description     TEXT,
    created         TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
    id             SERIAL      PRIMARY KEY,
    solution_id        INTEGER     REFERENCES solutions(id),
    user_id        INTEGER     REFERENCES users(id),
    created         TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_types (
    id                 SERIAL      PRIMARY KEY,
    background_color   TEXT        NOT NULL,
    is_user_icon       BOOLEAN     NOT NULL    DEFAULT FALSE,
    description        TEXT        NOT NULL,
    icon               TEXT
);

CREATE TABLE notifications (
    id             SERIAL                          PRIMARY KEY,
    user_id        INTEGER                         NOT NULL    REFERENCES users(id),
    type_id        INTEGER                         NOT NULL    REFERENCES notification_types(id),
    post_id        INTEGER,
    header         TEXT                            NOT NULL,
    subheader      TEXT                            NOT NULL,
    description    TEXT                            NOT NULL,
    action         TEXT                            NOT NULL,
    created        TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    seen           TIMESTAMP WITHOUT TIME ZONE,
    icon           TEXT                            NOT NULL    DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Infobox_info_icon.svg'
);

CREATE TABLE activity_types (
    id                 SERIAL      PRIMARY KEY,
    description        TEXT        NOT NULL
);

CREATE TABLE user_activities (
    id             SERIAL                          PRIMARY KEY,
    user_id        INTEGER                         NOT NULL    REFERENCES users(id),
    type_id        INTEGER                         NOT NULL    REFERENCES activity_types(id),
    post_id        INTEGER,
    created        TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activity_types(id, description) VALUES 
(1, 'Follow'),
(2, 'Unfollow'),
(3, 'Same Here'),
(4, 'Un Same Here'),
(5, 'New Post'),
(6, 'Remove Post');

INSERT INTO notification_types(id, background_color, is_user_icon, description, icon) VALUES 
(1, '#3FA5F899', TRUE, 'Follow', ''),
(2, '#3FA5F899', TRUE, 'Same Here', ''),
(3, '#F4E94B99', FALSE, 'Reward', 'notifReward'),
(4, '#c6f1e7', FALSE, 'Post Approved', 'postApproved'),
(5, '#ffcbcb', FALSE, 'Post Rejected', 'postRejected'),
(6, '#c6f1e7', TRUE, 'New Solution', '');



INSERT INTO public.regions(name)                VALUES ('North America');
INSERT INTO public.countries(name, region_id)   VALUES ('Canada', 1);
INSERT INTO public.states(name, country_id)     VALUES ('Alberta', 1);
INSERT INTO public.cities(name, state_id)       VALUES ('Calgary', 1);

INSERT INTO public.occupations(name) VALUES ('Software Developer');
INSERT INTO public.occupations(name) VALUES ('Financial Analyst');
INSERT INTO public.occupations(name) VALUES ('Accountant');
INSERT INTO public.occupations(name) VALUES ('Oil and Gas Engineer');
INSERT INTO public.occupations(name) VALUES ('Project manager');

INSERT INTO public.industries(name) VALUES ('Real Esate');
INSERT INTO public.industries(name) VALUES ('Investment Management');
INSERT INTO public.industries(name) VALUES ('Oil and Gas');
INSERT INTO public.industries(name) VALUES ('Consulting');
INSERT INTO public.industries(name) VALUES ('Dentistry');

INSERT INTO public.topics(name)                 VALUES ('Parking');
INSERT INTO public.subtopics(name, topic_id)    VALUES ('Expensive', 1);

INSERT INTO public.reject_reasons(description)    VALUES ('Incomplete Expression'), 
('Age restricted topic'), ('Too much capittalisation'), ('Bad language'), ('Forbidden content');