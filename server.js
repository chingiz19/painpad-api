require("dotenv").config({ path: ".env" });

const { GraphQLServer } = require("graphql-yoga");
const session = require("express-session");
const redis = require("redis");
const ms = require("ms");
const redisClient = redis.createClient();
const RedisStore = require("connect-redis")(session);

const port = process.env.SERVER_PORT;

let sessionStoreOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: parseInt(process.env.REDIS_DB),
  pass: process.env.REDIS_PASS,
  client: redisClient,
  logErrors: true,
  ttl: ms("7d"),
};

let sessionOptions = {
  name: "painpad.id",
  store: new RedisStore(sessionStoreOptions),
  secret: process.env.SESSION_SECRET_KEY,
  resave: true,
  rolling: true,
  saveUninitialized: true,
};

// context
const context = (req) => ({
  req: req.request,
});

// GraphQL Server options
const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers: {
    Query: require("./src/resolvers/query"),
    Mutation: require("./src/resolvers/mutation"),
  },
  context,
});

server.express.use(session(sessionOptions));

//Apollo Server options
let options = {
  endpoint: "/graphql",
  subscriptions: "/subscriptions",
  playground: "/playground",
  cors: {
    credentials: true,
    origin: [`http://localhost:${port}`, 'http://painpad.co', 'https://painpad.co']
  },
  port
};

// start server
server.start(options, ({ port }) =>
  console.log(`Server is running on http://localhost:${port}`)
);