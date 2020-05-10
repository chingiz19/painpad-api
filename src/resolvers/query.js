const User = require('./user');
const AWS = require('./aws');
const Feed = require('./feed');
const Admin = require('./admin');
const Asset = require('./asset');
const Auth = require('../models/Auth');

module.exports = {
  isLogin: (parent, args, { req }) => Auth.isLoggedin(req),
  isAdmin: (parent, args, { req }) => Auth.isAdminAuthorised(req),
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
  sameHereUsers: Feed.sameHereUsers,
  adminPendingPosts: Admin.pedningPosts,
  adminAllTopics: Admin.allTopics
};