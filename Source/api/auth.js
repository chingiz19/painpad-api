const router = require('express').Router();
const bcrypt = require('bcrypt');

/**
 * Logs in user
 */
router.get('/', Auth.isUserAuthorised, async function (req, res) {
    return Logger.sendSuccess(req, res);
});

/**
 * Logs in user
 */
router.post('/signIn', async function (req, res) {
    let paramVerify = Validator.verifyParams(req.body, {
        email: 'email',
        password: 'string'
    });

    if (!paramVerify.success) {
        return Logger.sendError(req, res, `Hmm... Please validate your inputs one more time`, paramVerify.devMessage);
    }

    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    let result = await User.getUserInformationByEmail(email);

    if (result) {
        let compareResult = await bcrypt.compare(password, result.password_hash);

        if (!compareResult) { return Logger.sendError(req, res, `Looks like password is wrong`); }

        req.session.user = result;
    } else {
        return Logger.sendError(req, res, `User doesn't exist`);
    }

    return Logger.sendSuccess(req, res);
});

/**
 * User registration
 */
router.post('/signUp', async function (req, res) {
    let paramVerify = Validator.verifyParams(req.body, {
        email: 'email',
        password: 'string'
    });

    if (!paramVerify.success) {
        return Logger.sendError(req, res, `Hmm... Please validate your inputs one more time`, paramVerify.devMessage);
    }

    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    let result = await User.getUserInformationByEmail(email);

    if (result) {
        let compareResult = await bcrypt.compare(password, result.password_hash);

        if (!compareResult) { return Logger.sendError(req, res, `Looks like password is wrong`); }

        req.session.user = result;
    } else {
        return Logger.sendError(req, res, `User doesn't exist`);
    }

    return Logger.sendSuccess(req, res);
});

router.get('/signOut', Auth.isUserAuthorised, function (req, res) {
    Logger.debug(`Signing user`, req.user, 'out...');
    
    delete req.session.user;

    return Logger.sendSuccess(req, res);
});

module.exports = router;