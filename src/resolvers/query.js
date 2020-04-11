module.exports = {
  isLogin: (parent, args, { req }) => typeof req.session.user !== "undefined",
};
