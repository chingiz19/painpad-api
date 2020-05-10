const User = require('./user');
const AWS = require('./aws');
const Feed = require('./feed');
const Asset = require('./asset');
const Auth = require('../models/Auth');

module.exports = {
  isLogin: (parent, args, { req }) => Auth.isLoggedin(req),
  locations: Asset.getLocations,
  industries: Asset.getIndustries,
  occupations: Asset.getOccupations,
  signin: User.signin,
  userProfile: User.profile,
  userStats: User.stats,
  signout: User.signout,
  signS3: AWS.signS3,
  userFeed: Feed.userFeed,
  userPosts: User.posts,
  userPendingPosts: Feed.pendingPosts,
  sameHereUsers: Feed.sameHereUsers
};