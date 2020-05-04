const User = require('./user');

module.exports = {
  signup: User.signup,
  changeProfile: User.changeProfile,
  follow: User.follow
};
