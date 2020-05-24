const Auth = require('../models/Auth');
const Subscriptions = require('../models/Subscriptions');

module.exports = {
  notificationCount: {
    subscribe: (parent, args, { req }) => {
      if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

      const userId = req.session.user.id;

      return Subscriptions.subscribe(userId, Subscriptions.SUBCRIPTION_CHANNELS.NOTIFICATION_COUNT);
    }
  },
  newPost: {
    subscribe: (parent, args, { req }) => {
      if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

      const userId = req.session.user.id;

      return Subscriptions.subscribe(userId, Subscriptions.SUBCRIPTION_CHANNELS.NEW_POST);
    }
  }
};
