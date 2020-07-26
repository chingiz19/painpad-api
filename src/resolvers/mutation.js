const User = require('./user');
const Feed = require('./feed');
const Admin = require('./admin');
const Email = require('../models/Email');

module.exports = {
  addOccupation: User.addOccupation,
  addIndustry: User.addIndustry,
  adminAddSubTopic: Admin.addSubTopic,
  adminAddRejectReason: Admin.addRejectReason,
  adminApprovePost: Admin.approvePost,
  adminAddTopic: Admin.addTopic,
  adminRejectPost: Admin.rejectPost,
  changeProfile: User.changeProfile,
  changePwd: User.changePassword,
  follow: User.follow,
  forgotPwd: Email.resetPassword,
  post: Feed.post,
  removePost: Feed.removePost,
  resetPwd: User.resetPwd,
  sameHere: Feed.sameHere,
  signup: User.signup,
  unFollow: User.unFollow
};
