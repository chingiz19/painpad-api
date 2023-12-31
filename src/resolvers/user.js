const Subscriptions = require('../models/Subscriptions');
const Auth = require('../models/Auth');
const User = require('../models/User');
const Email = require('../models/Email');

const TABLE = 'users';
const GENERIC_ERRROR = 'Unexpexted error occured while request';

async function signin(parent, { email, pwd }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('Already signed in');

    const ERROR_MESSAGE = 'Email or password is incorrect';

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

async function changeProfile(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let result = await User.changeUserProfile(userId, args);

    if (!result) throw new Error(GENERIC_ERRROR);

    req.session.user = result[0];

    return true
}

async function follow(parent, { userIdToFollow }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let userId = req.session.user.id;

    let insertData = {
        user_id: userId,
        follows: userIdToFollow
    }

    let result = await DB.insertValuesIntoTable('follows', insertData);

    if (!result) throw new Error(GENERIC_ERRROR);

    const userResult = await User.getQuickInfo(userId);

    if (!userResult) throw new Error('Error while implementing an action');

    const userName = userResult.name;
    const userProfilePic = userResult.profilePic;
    const userIndustry = userResult.industry;

    //TODO: check for recent activity

    let notificationData = {
        header: 'New Follower',
        subheader: userName,
        description: `From ${userIndustry.toLowerCase()} started <span>following<span> you`,
        action: `/users/${userId}`,
        icon: userProfilePic,
        typeId: 1
    }

    Subscriptions.notify(userIdToFollow, notificationData);

    return true
}

async function unFollow(parent, { userIdToUnFollow }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let where = [];
    let userId = req.session.user.id;

    where.push(DB.whereObj('user_id', '=', userId));
    where.push(DB.whereObj('follows', '=', userIdToUnFollow));

    let result = await DB.deleteFromWhere('follows', where);

    if (!result) throw new Error(GENERIC_ERRROR);

    return true
}

async function changePassword(parent, { oldPwd, newPwd }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

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

    let selectResult = await DB.selectFromWhere(TABLE, ['INITCAP(first_name) AS "firstName", *'], userId);

    if (!selectResult) throw new Error('User is not found');

    let user = selectResult[0];

    let newCompareResult = await Auth.comparePasswords(newPwd, user.password_hash);

    if (newCompareResult) throw new Error('New passwrod can not be same as old');

    let updateData = { password_hash: await Auth.generatePassHash(newPwd) }

    let result = await DB.updateValuesInTable(TABLE, userId, updateData);

    if (!result) throw new Error(GENERIC_ERRROR);

    Email.afterResetPasswordNotification(user.email, user.firstName);

    return true;
}

async function addOccupation(parent, { name }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let select = await DB.selectFromWhere('occupations', ['id'], [DB.whereObj('name', '=', name)]);

    if (select) throw new Error('Given occupation already exists');

    let result = await DB.insertValuesIntoTable('occupations', { name });

    if (!result) throw new Error('Error while adding occupation');

    return result.id;
}

async function addIndustry(parent, { name }, { req }) {
    let select = await DB.selectFromWhere('industries', ['id'], [DB.whereObj('name', '=', name)]);

    if (select) throw new Error('Given industry already exists');

    let data = {
        name: name,
        parent_industry_id: 25
    }

    let result = await DB.insertValuesIntoTable('industries', data);

    if (!result) throw new Error('Error while adding industry');

    return result.id;
}

async function addSolution(parent, { postId, logo, name, website, description }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    let solutionUserId = req.session.user.id;

    let data = {
        post_id: postId,
        user_id: solutionUserId,
        logo: logo,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        website: website && website.toLowerCase(),
        description: description
    }

    let insertResult = await DB.insertValuesIntoTable('solutions', data);

    if (!insertResult) throw new Error('Could not insert solution into DB');

    const solutionUserResult = await User.getQuickInfo(solutionUserId);

    if (!solutionUserResult) throw new Error('Error while getting solution-user data');

    const postUserResult = await DB.selectFromWhere('posts', [`user_id`], postId);

    if (!postUserResult) throw new Error('Error while getting post-user data');

    const postUserId = postUserResult[0].user_id;

    if (postUserId !== solutionUserId) {
        User.incrementScore(solutionUserId, 5, "You deserved it - thanks for helping the community!");

        let notificationData = {
            header: 'New Solution',
            subheader: name.toLowerCase(),
            description: 'was suggested as a solution to your painful experience',
            postId: postId,
            action: `/posts/${postId}`,
            icon: logo,
            typeId: 6
        }

        Subscriptions.notify(postUserId, notificationData);
    }

    return true;
}

module.exports = { signin, signup, profile, signout, stats, changeProfile, follow, changePassword, unFollow, resetPwd, addOccupation, addIndustry, addSolution };