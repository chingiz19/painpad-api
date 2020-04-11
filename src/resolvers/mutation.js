const bcrypt = require("bcryptjs");

const data = {};

module.exports = {
  signup: async (parent, { username, pwd }, ctx) => {
    if (data[username]) {
      throw new Error("Another User with same username exists.");
    }

    data[username] = {
      pwd: await bcrypt.hashSync(pwd, 10),
    };

    return true;
  },
  login: async (parent, { username, pwd }, { req }) => {
    const user = data[username];
    if (user) {
      if (await bcrypt.compareSync(pwd, user.pwd)) {
        req.session.user = {
          ...user,
        };
        return true;
      }

      throw new Error("Incorrect password.");
    }

    throw new Error("No Such User exists.");
  },
};
