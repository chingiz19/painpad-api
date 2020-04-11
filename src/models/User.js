const DB = require('./Database');

async function getUserInformationByEmail() {
    let query = ``;

    try {
        let result = await DB.query(query);

        if (result && result.rows && result.rows.length > 0) {
            return result.rows;
        }
    } catch (error) {
        console.error('Error @ User.getUserInformationByEmail()', error.message);
    }

    return false;
}

module.exports = { getUserInformationByEmail }