const Auth = require('../models/Auth');
const User = require('../models/User');
const Feed = require('../models/Feed');

const TABLE = 'users';
const GENERIC_ERRROR = 'Unexpexted error occured while request';

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

    if (selectResult) throw new Error('Hmm, seems like user with this email already exists');

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
    return req.session.destroy() && true;
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
    let following = await User.getUserStats(userId, 'user_id', 'follows');
    let followers = await User.getUserStats(userId, 'follows', 'user_id');

    if (!followers || !following) throw new Error(GENERIC_ERRROR);

    return { following, followers }
}

async function posts(parent, { userId }, { req }) {
    let result = await Feed.getUserFeed(userId)

    if (!result) throw new Error(GENERIC_ERRROR);

    return result;
}

async function changeProfile(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    let userId = req.session.user.id;

    let result = await User.changeUserProfile(userId, args);

    if (!result) throw new Error(GENERIC_ERRROR);

    req.session.user = result[0];

    return true
}

async function follow(parent, { userIdToFollow }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    let userId = req.session.user.id;

    let insertData = {
        user_id: userId,
        follows: userIdToFollow
    }

    //TODO: notify user that is being followed (label -> notification)

    let result = await DB.insertValuesIntoTable('follows', insertData);

    if (!result) throw new Error(GENERIC_ERRROR);

    return true
}

async function unFollow(parent, { userIdToUnFollow }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    let where = [];
    let userId = req.session.user.id;

    where.push(DB.whereObj('user_id', '=', userId));
    where.push(DB.whereObj('follows', '=', userIdToUnFollow));

    let result = await DB.deleteFromWhere('follows', where);

    if (!result) throw new Error(GENERIC_ERRROR);

    return true
}


async function changePassword(parent, { oldPwd, newPwd }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error('Not signed in');

    let passwordHash = req.session.user.password_hash;

    let oldCompareResult = await Auth.comparePasswords(oldPwd, passwordHash);

    if (!oldCompareResult) throw new Error('Existing passwrod is incorrect');

    let newCompareResult = await Auth.comparePasswords(newPwd, passwordHash);

    if (newCompareResult) throw new Error('New passwrod can not be same as old');

    let userId = req.session.user.id;
    let updateData = { password_hash: await Auth.generatePassHash(newPwd) }

    let result = await DB.updateValuesInTable(TABLE, userId, updateData);

    if (!result) throw new Error(GENERIC_ERRROR);

    req.session.user = result[0];

    return true;
}

async function resetPwd(parent, { newPwd, token }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('Already signed in');

    let payload = Auth.verifyJWT(token);

    if (!payload) throw new Error('Expired or invalid token');

    let userId = payload.userId;

    let selectResult = await DB.selectFromWhere(TABLE, ['*'], userId);

    if (!selectResult) throw new Error('User is not found');

    let user = selectResult[0];

    let newCompareResult = await Auth.comparePasswords(newPwd, user.password_hash);

    if (newCompareResult) throw new Error('New passwrod can not be same as old');
    
    let updateData = { password_hash: await Auth.generatePassHash(newPwd) }

    let result = await DB.updateValuesInTable(TABLE, userId, updateData);

    if (!result) throw new Error(GENERIC_ERRROR);

    return true;
}

module.exports = { signin, signup, profile, signout, posts, stats, changeProfile, follow, changePassword, unFollow, resetPwd };