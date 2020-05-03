require("dotenv").config({ path: ".env" });

const { GraphQLServer } = require("graphql-yoga");
const session = require("express-session");
const redis = require("redis");
const ms = require("ms");
const redisClient = redis.createClient();
const RedisStore = require("connect-redis")(session);

const port = process.env.SERVER_PORT;
const maxAge = process.env.COOKIE_MAX_AGE;

let sessionStoreOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: parseInt(process.env.REDIS_DB),
  pass: process.env.REDIS_PASS,
  client: redisClient,
  logErrors: true,
  ttl: ms(`${maxAge}d`)
};

let sessionOptions = {
  name: "painpad",
  store: new RedisStore(sessionStoreOptions),
  secret: process.env.SESSION_SECRET_KEY,
  resave: true,
  rolling: true,
  saveUninitialized: true
};

// GraphQL Server options
const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers: {
    Query: require("./src/resolvers/query"),
    Mutation: require("./src/resolvers/mutation"),
    Subscription: require("./src/resolvers/subscription"),
  },
  context: ({ request, connection }) => {
    let binder;

    if (request) {
      binder = request;
    } else if (connection && connection.context && connection.context.request) {
      binder = connection.context.request;
      console.log('Going through context');
    }

    // console.log('Sending context req with session', binder.sessionID);

    return { req: binder };
  }
});

let sessionMiddleWare = session(sessionOptions);

server.express.use(sessionMiddleWare);

//Apollo Server options
let options = {
  port,
  endpoint: "/graphql",
  playground: "/playground",
  subscriptions: {
    path: "/subscriptions",
    onConnect: async (connectionParams, webSocket) => {
      try {
        const promise = new Promise((resolve, reject) => {
          sessionMiddleWare(webSocket.upgradeReq, {}, () => {
            resolve(webSocket.upgradeReq.session);
          });
        });

        const session = await promise;

        return { request: session.req };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  cors: {
    credentials: true,
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://api.painpad.co"
    ]
  }
};

//DB connection
global.DB = require('./src/models/Database');

// start server
server.start(options, ({ port }) =>
  console.log(`Server is running on http://localhost:${port}`)
);
