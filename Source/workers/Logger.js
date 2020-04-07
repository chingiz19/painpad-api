/**
 * 1 - Debug, 2 - Info
 */
const SET_LOG_LEVEL = 1;

function debug() {
    printLog(arguments, 1);
}

function info() {
    printLog(arguments, 2);
}

/**
 * Prints out object to console format => key: value
 * @param {Object} obj 
 */
function printObj(obj) {
    newLine();

    let printString = '';

    for (const [key, value] of Object.entries(obj)) {
        printString += `${key} : ${value}\n`
    }

    console.log(printString);
}

function exit() {
    newLine();
    console.log('Exiting...');
    process.exit();
}

function newLine() {
    console.log('');
}

function sendSuccess(req, res, inData = {}, inMessage = 'Success!', inDevMessage = undefined) {
    let responseObject = {
        success: true,
        data: inData,
        message: inMessage,
        devMessage: inDevMessage
    }

    Logger.debug('API success => ', req.baseUrl, inMessage); //JSON.stringify(inData)

    return res.send(responseObject);
}

function sendError(req, res, inMessage, inDevMessage) {
    let responseObject = {
        success: false,
        data: [],
        message: inMessage,
        devMessage: inDevMessage
    }

    console.error('API error => ', req.baseUrl, inMessage);

    return res.send(responseObject);
}

module.exports = {
    printObj,
    exit,
    debug,
    info,
    newLine,
    sendSuccess,
    sendError
}

function printLog(argArray, givenLogLevel) {
    let result = [];

    for (var i = 0; i < argArray.length; i++) {
        result.push(argArray[i]);
    }

    if (givenLogLevel <= SET_LOG_LEVEL) console.log(result.join(' '));
}