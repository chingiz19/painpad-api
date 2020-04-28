const bcrypt = require('bcrypt');

const USER_LEVEL = 2;
const ERROR_NOT_AUTH = 'Not authorized';

async function generatePassHash(plain) {
    return await bcrypt.hash(plain, 256);
}

async function comparePasswords(plain, hash) {
    return await bcrypt.compare(plain, hash)
}

function isUserAuthorised(req) {
    return req.session && req.session.user && req.session.user.p_level <= USER_LEVEL ? true : false;
};

module.exports = { ERROR_NOT_AUTH, generatePassHash, isUserAuthorised, comparePasswords }