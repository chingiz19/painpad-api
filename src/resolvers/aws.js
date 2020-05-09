const Auth = require('../models/Auth');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function signS3(parent, { fileName, fileType }, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Auth.AuthenticationError();

    const s3 = new aws.S3();

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 180, //seconds
        ContentType: fileType,
        ACL: 'public-read'
    };

    let awsResult = s3.getSignedUrl('putObject', s3Params);

    if (!awsResult) throw new Error('AWS Signing error');

    return {
        uploadUrl: awsResult,
        fileUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    }
}

module.exports = { signS3 }