const User = require('./user');
const Asset = require('./asset');
const Auth = require('../models/Auth');

module.exports = {
  isLogin: (parent, args, { req }) => Auth.isUserAuthorised(req),
  locations: Asset.getLocations,
  industries: Asset.getIndustries,
  occupations: Asset.getOccupations,
  signin: User.signin,
  userProfile: User.profile,
  userStats: User.stats,
  userPosts: User.posts,
  signout: User.signout
};