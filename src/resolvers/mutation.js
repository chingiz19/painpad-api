const User = require('./user');
const Feed = require('./feed');
const Admin = require('./admin');
const Email = require('../models/Email');

module.exports = {
  signup: User.signup,
  changeProfile: User.changeProfile,
  changePwd: User.changePassword,
  follow: User.follow,
  unFollow: User.unFollow,
  forgotPwd: Email.resetPassword,
  resetPwd: User.resetPwd,
  post: Feed.post,
  sameHere: Feed.sameHere,
  adminAddTopic: Admin.addTopic,
  adminAddSubTopic: Admin.addSubTopic,
  adminApprovePost: Admin.approvePost,
  removePost: Feed.removePost,
  adminAddRejectReason: Admin.addRejectReason,
  adminRejectPost: Admin.rejectPost
};
