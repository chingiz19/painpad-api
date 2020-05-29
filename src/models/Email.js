const sgMail = require('@sendgrid/mail');
const Auth = require('./Auth');

const RESET_PASSWORD_LINK = 'https://painpad.co/resetPass/';

const FROM_ADDRESS = 'hello@painpad.co';
const FROM_NAME = 'PainPad Inc.';
const RESET_PASSWORD_TEMPLATE_ID = 'd-0832480438e94e4284d1315a5328e0c2';
const AFTER_RESET_PASSWORD_NOTIFICATION_TEMPLATE_ID = 'd-a1b6f8efcbfc4502a999b04d9c625806';
const REJECTED_POST_TEMPLATE_ID = 'd-9fafacff7a46403a8f607f74ff3c7306';
const COUNT_REMINDER_TEMPLATE_ID = 'd-2c5953ba19c2404691edde3418322941';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function resetPassword(parent, { email }, { req }) {
    if (Auth.isUserAuthorised(req)) throw new Error('User already signed in');

    let whereObj = DB.whereObj('email', '=', email.toLowerCase());

    let selectResult = await DB.selectFromWhere('users', ['id', 'email', 'INITCAP(first_name) AS name'], [whereObj]);

    if (!selectResult) {
        console.log('User email for forgotPwd was not found');
        return true;
    }

    let user = selectResult[0];

    let signature = Auth.signJWTToken({ userId: user.id });

    if (!signature) throw new Error('Error while verifying signature');

    let emailData = {
        link: (RESET_PASSWORD_LINK + signature),
        firstName: user.name
    }

    let result = await sendEmail(user.email, RESET_PASSWORD_TEMPLATE_ID, emailData);

    if (!result) { throw new Error('Error while requesting email') }

    return true;
}

async function afterResetPasswordNotification(email, firstName) { //TODO: needs testing
    let result = await sendEmail(email, AFTER_RESET_PASSWORD_NOTIFICATION_TEMPLATE_ID, { firstName });

    if (!result) console.error('Error while sending AFTER_RESET_PASSWORD_NOTIFICATION_TEMPLATE_ID email');

    return result;
}

async function afterResetPasswordNotification(email, firstName, actionUrl, reasonText, { suggestion, explanation }) { //TODO: needs testing
    const data = {
        firstName,
        actionUrl,
        reasonText,
        suggestionText: suggestion ? suggestion : 'No suggestion has been provided',
        explanationText: explanation ? explanation : 'No explanation has been provided'
    }

    let result = await sendEmail(email, REJECTED_POST_TEMPLATE_ID, data);

    if (!result) console.error('Error while sending REJECTED_POST_TEMPLATE_ID email');

    return result;
}

async function countReminderNotification(email, firstName, count) { //TODO: needs testing
    let result = await sendEmail(email, COUNT_REMINDER_TEMPLATE_ID, { firstName, count });

    if (!result) console.error('Error while sending COUNT_REMINDER_TEMPLATE_ID email');

    return result;
}

/**
 * Sends email through sendGrid
 * @param {*} to to address
 * @param {*} template_id sendGrid template ID
 * @param {*} dynamic_template_data data used in the template
 */
async function sendEmail(to, template_id, dynamic_template_data) {
    const msg = {
        to, template_id, dynamic_template_data,
        from: { email: FROM_ADDRESS, name: FROM_NAME }
    };

    let result = await sgMail.send(msg);

    return result && true;
}

module.exports = { resetPassword, afterResetPasswordNotification, afterResetPasswordNotification, countReminderNotification }