let api = require('express')();

api.use(`/auth/`, require('./auth'));
api.use(`/user/`, Auth.isUserAuthorised, require('./user'));

module.exports = api;