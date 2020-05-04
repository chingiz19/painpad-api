const User = require('./user');
const Email = require('../models/Email');

module.exports = {
  signup: User.signup,
  changeProfile: User.changeProfile,
  changePwd: User.changePassword,
  follow: User.follow,
  resetPassword: Email.resetPassword
};
