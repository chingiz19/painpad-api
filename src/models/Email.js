const sgMail = require('@sendgrid/mail');
const Auth = require('./Auth');

const RESET_PASSWORD_LINK = 'http://localhost:3000/resetPwd/';  //TODO: change this to actual production link one Elnar is done testing

const FROM_ADDRESS = 'hello@painpad.co';
const FROM_NAME = 'PainPad Inc.';
const RESET_PASSWORD_TEMPLATE_ID = 'd-0832480438e94e4284d1315a5328e0c2';

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

    //TODO: delete after Chingiz is done with testing
    console.log('Link for reset password', (RESET_PASSWORD_LINK + signature));

    let emailData = {
        link: (RESET_PASSWORD_LINK + signature),
        firstName: user.name
    }

    let result = await sendEmail(user.email, RESET_PASSWORD_TEMPLATE_ID, emailData);

    if (!result) { throw new Error('Error while requesting email') }

    return true;
}

async function sendEmail(to, template_id, dynamic_template_data) {
    const msg = {
        to, template_id, dynamic_template_data,
        from: { email: FROM_ADDRESS, name: FROM_NAME }
    };

    let result = await sgMail.send(msg);

    return result && true;
}

module.exports = { resetPassword }