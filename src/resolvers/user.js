const Auth = require('../models/Auth');
const User = require('../models/User');
const TABLE = 'users';
const GENERIC_ERRROR = 'Error while retrieving user info';

async function signin(parent, { email, pwd }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('Already signed in');

    const ERROR_MESSAGE = 'Email or password is wrong';

    let whereObj = DB.whereObj('email', '=', email.toLowerCase());

    let userInfo = await DB.selectFromWhere(TABLE, ['*'], [whereObj]);

    if (!userInfo) throw new Error(ERROR_MESSAGE);

    let user = userInfo[0];

    let compareResult = await Auth.comparePasswords(pwd, user.password_hash);

    if (!compareResult) throw new Error(ERROR_MESSAGE);

    req.session.user = user;

    return true;
}

async function signup(parent, { firstName, lastName, email, pwd, cityId, industryId }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('Already signed in');

    let whereObj = DB.whereObj('email', '=', email.toLowerCase());

    let selectResult = await DB.selectFromWhere(TABLE, ['*'], [whereObj]);

    if (selectResult) throw new Error('Hmm, seems like user already exists');

    let data = {
        first_name: firstName.toLowerCase(),
        last_name: lastName.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: await Auth.generatePassHash(pwd),
        industry_id: industryId,
        city_id: cityId
    }

    let insertResult = await DB.insertValuesIntoTable(TABLE, data);

    if (!insertResult) throw new Error('Could not insert into DB');

    req.session.user = insertResult;

    return true;
}

async function signout(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    delete req.session.user;

    return true;
}

async function profile(parent, { userId }, { req }) {
    let existingUserId = (req.session.user && req.session.user.id) || -1;

    let userInfo = await User.getUserInformation(userId);

    if (!userInfo) throw new Error(GENERIC_ERRROR);

    return {
        self: existingUserId === Number(userId),
        user: userInfo
    }
}

async function stats(parent, { userId }, { req }) {
    let following = await User.getUserStats(userId, 'follows');
    let followers = await User.getUserStats(userId, 'user_id');

    if (!followers || !following) throw new Error(GENERIC_ERRROR);

    return { following, followers }
}

async function posts(parent, { userId }, { req }) {  //TODO: needs verification
    let userPosts = await User.getUserPosts(userId);

    if (!userPosts) throw new Error(GENERIC_ERRROR);

    return userPosts
}

module.exports = { signin, signup, profile, signout, posts, stats };