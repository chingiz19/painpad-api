const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { createError } = require("apollo-errors");

const JWT_KEY = process.env.JWT_KEY;
const JWT_EXPIRATION = 24 * 60 * 60; //24 hours
const USER_LEVEL = 2;
const ERROR_MESSAGE = 'Not authorized';

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

function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_KEY);
    } catch (error) {
        return false;
    }
}

function isLoggedin(req) {
    let response;

    if (isUserAuthorised(req)) {
        response = { success: true, id: req.session.user.id }
    } else {
        response = { success: false, id: 0 }
    }

    return response;
};

function isUserAuthorised(req) {
    return req.session && req.session.user && USER_LEVEL <= req.session.user.p_level && true;
};

const AuthenticationError = createError("AuthError", {
    data: {code: 1},
    message: ERROR_MESSAGE
});

module.exports = { generatePassHash, isUserAuthorised, comparePasswords, isLoggedin, signJWTToken, verifyJWT, AuthenticationError }