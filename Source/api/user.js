const router = require('express').Router();

/**
 * User info
 */
router.get('/getUserInfo', Auth.isUserAuthorised, async function (req, res) {
    return Logger.sendSuccess(req, res, req.session.user);
});

module.exports = router;