const { PubSub } = require("graphql-subscriptions");
const Auth = require('../models/Auth');

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
  notificationCount: {
    subscribe: (parent, args, { req }) => {
      if (typeof req.session.user === "undefined") {
        throw new Auth.AuthenticationError();
      }

      return pubsub.asyncIterator("SOMETHING_CHANGED_TOPIC"); //TODO: edit this
    }
  }
};
