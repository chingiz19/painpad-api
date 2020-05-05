const sgMail = require('@sendgrid/mail');
const Auth = require('./Auth');

const FROM_ADDRESS = 'hello@painpad.co';
const RESET_PASSWORD_TEMPLATE_ID = 'd-0832480438e94e4284d1315a5328e0c2';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function resetPassword(parent, { email }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('User already signed in');

    //TODO: check if user exists, then retrieve email, first, and last names

    let emailData = {
        link: "https://www.wikipedia.org",
        firstName: "Chingiz"
    }

    let result = await sendEmail('chingiz.baxishov@gmail.com', RESET_PASSWORD_TEMPLATE_ID, emailData);

    return result && true;
}

async function sendEmail(to, template_id, dynamic_template_data) {
    const msg = {
        to, template_id, dynamic_template_data,
        from: {email: FROM_ADDRESS, name: "PainPad Inc." }
    };

    let result = await sgMail.send(msg);

    return result && true;
}

module.exports = { resetPassword }