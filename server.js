
require('dotenv').config({ path: '.env' });

require('./Source/workers/init');

const port = process.env.SERVER_PORT;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let httpServer = app.listen(port, 'localhost', function () {
    Logger.debug(`Listening on port ${port}!`);
});

let io = require('socket.io')(httpServer);

const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
const RedisStore = require('connect-redis')(session);

let sessionStoreOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: parseInt(process.env.REDIS_DB),
    pass: process.env.REDIS_PASS,
    client: redisClient,
    logErrors: true,
    ttl: 30 * 24 * 60 * 60 * 1000
}

let sessionOptions = {
    store: new RedisStore(sessionStoreOptions),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    rolling: true,
    saveUninitialized: false
}

app.use(session(sessionOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//handle api endpoints
app.use('/', require('./Source/api/init'));

//if nothing exists then 404
app.use(function (req, res, next) {
    res.status(404);
    return Logger.sendError(req, res, `${req.baseUrl} API endpoint does not exist`);
});