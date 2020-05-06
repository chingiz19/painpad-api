const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;
const JWT_EXPIRATION = 24 * 60 * 60; //24 hours
const USER_LEVEL = 2;
const ERROR_NOT_AUTH = 'Not authorized';

async function generatePassHash(plain) {
    return await bcrypt.hash(plain, 256);
}

async function comparePasswords(plain, hash) {
    return await bcrypt.compare(plain, hash)
}

function signJWTToken(payload, expiresIn = JWT_EXPIRATION) {
    const token = jwt.sign(payload, JWT_KEY, {
        algorithm: "HS256",
        expiresIn
    })

    return token;
}

const verifyJWT = (token) => jwt.verify(token, JWT_KEY);

function isLoggedin(req) {
    let response;

    if (req.session && req.session.user && req.session.user.p_level <= USER_LEVEL) {
        response = { success: true, id: req.session.user.id }
    } else {
        response = { success: false, id: 0 }
    }

    return response;
};

function isUserAuthorised(req) {
    return req.session && req.session.user && req.session.user.p_level <= USER_LEVEL && true;
};

module.exports = { ERROR_NOT_AUTH, generatePassHash, isUserAuthorised, comparePasswords, isLoggedin, signJWTToken, verifyJWT }