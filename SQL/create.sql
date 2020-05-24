DROP TABLE IF EXISTS occupations, industries, users, regions, countries, states, 
cities, posts, approved_posts, topics, subtopics, follows, same_heres, reject_reasons,
rejected_posts, notifications CASCADE;

CREATE TABLE occupations (
 id             SERIAL      PRIMARY KEY,
 name           TEXT        NOT NULL
);

CREATE TABLE industries (
 id             SERIAL      PRIMARY KEY,
 name           TEXT        NOT NULL
);

CREATE TABLE regions (
 id             SERIAL      PRIMARY KEY,
 name           TEXT        NOT NULL
);

CREATE TABLE countries (
 id             SERIAL      PRIMARY KEY,
 name           TEXT        NOT NULL,
 short_name     TEXT        NOT NULL,
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
 profile_pic        TEXT                                NOT NULL    DEFAULT 'https://painpad-profile-pictures.s3.amazonaws.com/painpad_default',
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
 industry_id    INTEGER                         NOT NULL REFERENCES industries(id),
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
 post_id        INTEGER     REFERENCES approved_posts(post_id)
);

CREATE TABLE follows (
 id         SERIAL      PRIMARY KEY,
 user_id    INTEGER     REFERENCES users(id),     
 follows    INTEGER     REFERENCES users(id)
);

CREATE TABLE notifications (
 id             SERIAL                          PRIMARY KEY,
 user_id        INTEGER                         NOT NULL    REFERENCES users(id),
 description    TEXT                            NOT NULL,
 action         TEXT,
 created        TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP,
 seen           TIMESTAMP WITHOUT TIME ZONE,
 icon           TEXT                            NOT NULL    DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Infobox_info_icon.svg'
);

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