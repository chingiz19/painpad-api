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

module.exports = {
    debug,
    info
}

function printLog(argArray, givenLogLevel) {
    let result = [];

    for (var i = 0; i < argArray.length; i++) {
        result.push(argArray[i]);
    }

    if (givenLogLevel <= SET_LOG_LEVEL) console.log(result.join(' '));
}