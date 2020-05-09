let { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
  newPost: {
    subscribe: (parent, args, { req }) => {
      if (typeof req.session.user === "undefined") {
        throw new Auth.AuthenticationError();
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  },
  notification: {
    subscribe: (parent, args, { req }) => {
      if (typeof req.session.user === "undefined") {
        throw new Auth.AuthenticationError();
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  }
};
