const Admin = require('./admin');
const Asset = require('./asset');
const Auth = require('../models/Auth');
const AWS = require('./aws');
const Feed = require('./feed');
const Search = require('./search');
const Topic = require('./topic');
const User = require('./user');

module.exports = {
  adminAllTopics: Admin.allTopics,
  adminAnalytics: Admin.getAdminAnalytics,
  adminGetRejectReasons: Admin.getRejectReasons,
  adminPendingPosts: Admin.pedningPosts,
  isAdmin: (parent, args, { req }) => Auth.isAdminAuthorised(req),
  industries: Asset.getIndustries,
  isLogin: (parent, args, { req }) => Auth.isLoggedin(req),
  locations: Asset.getLocations,
  newNotificationCount: Feed.newNotificationCount,
  notifications: Feed.notifications,
  occupations: Asset.getOccupations,
  posts: Feed.posts,
  rejectedPost: Feed.getRejectedPost,
  sameHereUsers: Feed.sameHereUsers,
  search: Search.search,
  signin: User.signin,
  signout: User.signout,
  signS3: AWS.signS3,
  solutions: Feed.solutions,
  topicList: Topic.getTopicList,
  topicStats: Topic.getTopicStats,
  userPendingPosts: Feed.pendingPosts,
  userProfile: User.profile,
  userStats: User.stats
};