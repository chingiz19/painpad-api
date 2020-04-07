const bcrypt = require('bcrypt');

async function generatePassHashAndSalt(plain) {
    return await bcrypt.hash(plain, 256);
}

function isUserAuthorised(req, res, next) {
    return isAuthorised(req, res, next)
};

module.exports = { generatePassHashAndSalt, isUserAuthorised }

function isAuthorised(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        Logger.sendError(req, res, `not authorized`);
    }
}