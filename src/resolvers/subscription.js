let { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
  newPost: {
    subscribe: (parent, args, {req}) => {
      if (typeof req.session.user === "undefined") {
        throw new Error("User is not authorized");
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  },
  sameHere: {
    subscribe: (parent, args, {req}) => {
      if (typeof req.session.user === "undefined") {
        throw new Error("User is not authorized");
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  },
  notification: {
    subscribe: (parent, args, {req}) => {
      if (typeof req.session.user === "undefined") {
        throw new Error("User is not authorized");
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  }
};
