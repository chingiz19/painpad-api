const Auth = require('../models/Auth');
const Subscriptions = require('../models/Subscriptions');

module.exports = {
  newNotificationCount: {
    subscribe: (parent, args, { req }) => {
      if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

      const userId = req.session.user.id;

      return Subscriptions.subscribe(Subscriptions.SUBCRIPTION_CHANNELS.NOTIFICATION_COUNT + userId);
    }
  },
  newPost: {
    subscribe: (parent, args, { req }) => {
      if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

      return Subscriptions.subscribe(Subscriptions.SUBCRIPTION_CHANNELS.NEW_POST);
    }
  }
};
