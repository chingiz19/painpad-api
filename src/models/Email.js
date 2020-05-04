const sgMail = require('@sendgrid/mail');
const Auth = require('./Auth');

// const FROM_ADDRESS = 'hello@painpad.co';
const FROM_ADDRESS = 'test@example.com';
const FAIL_BACK_TEXT = 'Sorry for invonvenince, email could not be viewed in html format';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function resetPassword(parent, { email }, { req }) { //TODO: complete call
    if (Auth.isUserAuthorised(req)) throw new Error('User already signed in');

    let result = await sendEmail('test@example.com', '<strong>and easy to do anywhere, even with Node.js</strong>');

    return result && true;
}

async function sendEmail(to, subject, html, text = FAIL_BACK_TEXT) {
    const msg = {
        to, subject, text, html,
        from: FROM_ADDRESS
    };

    let result = await sgMail.send(msg);

    return result && true;
}

module.exports = { resetPassword }