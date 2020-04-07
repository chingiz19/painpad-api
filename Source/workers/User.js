
async function getUserInformationByEmail() {
    let query = `
    UPDATE
        ${tableName}
    SET
        ${SQL_ADDITION_FIELDS.join(', ')}
    WHERE 
        ${whereClause.join(' AND ')}
    RETURNING 
        ${returning.join(', ')};`;

    try {
        let result = await connection.query({
            text: query,
            values: params
        });

        if (result && result.rows && result.rows.length > 0) {
            return result.rows;
        }
    } catch (error) {
        console.error('Error => db.updateValuesInTable()', error.message);
    }

    return false;
}

module.exports = { getUserInformationByEmail }