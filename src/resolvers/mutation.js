const User = require('./user');

module.exports = {
  signup: User.signup,
  changeProfile: User.changeProfile,
  changePwd: User.changePassword,
  follow: User.follow
};
