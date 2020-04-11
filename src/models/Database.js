/**
 * This module is responsible for database connections and 
 * simple and generic utility functions
 */

/**
 * ISO 8601 string can't be directly converted into a UTC date by the Date constructor. 
 * Our options are: Modify the string so that it will be interpreted as UTC.
 * https://stackoverflow.com/questions/20712291/use-node-postgres-to-get-postgres-timestamp-without-timezone-in-utc
 */
const pg = require('pg');
const Logger = require('./Logger');

const Client = pg.Client;
let types = pg.types;

const database = process.env.DB_NAME;

let pgSettings = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database
};

types.setTypeParser(1114, function (stringValue) {
    return new Date(stringValue + "+0000");
});

let connection = new Client(pgSettings);

connection.connect((err) => {
    if (err) {
        console.error('Error while connecting to', database, err.stack);
        return Logger.exit();
    }
    
    Logger.debug(`Connected to 127.0.0.1:${database}`);
});

async function query(inQuery, params = undefined) {
    if (inQuery && params && params.length > 0) {

        const query = {
            text: inQuery,
            values: params
        };

        return connection.query(query);
    } else if (inQuery) {
        return connection.query(inQuery);
    }

    return false;
}

/**
 * Inserts values into table and auto generates parameters for 'pg'
 * 
 * @param {*} tableName table name
 * @param {*} data row data to insert where key-> column name, value -> column value
 */
async function insertValuesIntoTable(tableName, data, returning = ['*']) {
    let result;
    let params = [];
    let counter = 1;
    let SQL_ADDITION_FIELDS = [];
    let SQL_ADDITION_VALUES = [];

    for (const [columnName, columnValue] of Object.entries(data)) {

        if (columnValue != undefined) {
            params.push(columnValue);
            SQL_ADDITION_FIELDS.push(columnName);
            SQL_ADDITION_VALUES.push('$' + counter);
            counter++;
        }
    }

    let query = `INSERT INTO ${tableName} 
        (${SQL_ADDITION_FIELDS.join(', ')})
    VALUES 
        (${SQL_ADDITION_VALUES.join(', ')})
    RETURNING ${returning.join(', ')};`;

    try {
        result = await connection.query({
            text: query,
            values: params
        });
    } catch (error) {
        console.error('Error => db.insertValuesIntoTable()', error.message);
    }

    if (result && result.rows && result.rows.length === 1) {
        return result.rows[0];
    }

    return false;
}

/**
 * Drops table if exists
 * @param {*} tableName  table name
 */
async function dropTable(tableName) {
    let result;

    let query = `DROP TABLE IF EXISTS ${tableName};`;

    try {
        result = await connection.query(query);
    } catch (error) {
        console.error(`Error dropping ${tableName} => db.dropTable() for`, database, error.message);
    }

    return result && true;
}

/**
 * Updates values in the table and auto generates parameters for 'pg'
 * 
 * @param {*} tableName table name
 * @param {*} inWhere can be and id or array of objects -> same as selectFromWhere
 * @param {*} data update data where {column: value (to update to)}
 * @param {*} returning returning condition
 */
async function updateValuesInTable(tableName, inWhere, data, returning = ['*']) {
    let result;
    let where;
    let whereClause = [];
    let params = [];
    let counter = 1;
    let SQL_ADDITION_FIELDS = [];

    for (const [columnName, columnValue] of Object.entries(data)) {
        params.push(columnValue);
        SQL_ADDITION_FIELDS.push(columnName + '=$' + counter);
        counter++;
    }

    if (Array.isArray(inWhere)) {
        where = inWhere;
    } else {
        where = [{
            attribute: 'id',
            operator: '=',
            value: inWhere,
            useRaw: false
        }]
    }

    where.forEach(clause => {
        let attribute = clause.attribute;
        let operator = clause.operator;
        let value = clause.value;
        let useRaw = clause.useRaw;

        if (useRaw) {
            whereClause.push(`${attribute} ${operator} ${value}`);
        } else {
            whereClause.push(`${attribute} ${operator} $${counter}`);
            params.push(value);
            counter++;
        }
    });

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
        result = await connection.query({
            text: query,
            values: params
        });
    } catch (error) {
        console.error('Error => db.updateValuesInTable()', error.message);
    }

    if (result && result.rows && result.rows.length > 0) {
        return result.rows;
    }

    return false;
}

/**
 * Deletes rows from given table with where condition
 * @param {*} table table name
 * @param {*} inWhere  where clause must be - > [{
        attribute: columname,
        operator: 'IS'/'='/etc.,
        value: number/string/boolean/null,
        useRaw: true/false  means insert into query as text
    }];
 * @param {*} returning columns to return
 */
async function deleteFromWhere(table, inWhere, returning = ['*']) {
    let result;
    let counter = 1;
    let params = [];
    let whereClause = [];

    if (Array.isArray(inWhere)) {
        where = inWhere;
    } else {
        where = [{
            attribute: 'id',
            operator: '=',
            value: inWhere,
            useRaw: false
        }]
    }

    where.forEach(clause => {
        let attribute = clause.attribute;
        let operator = clause.operator;
        let value = clause.value;
        let useRaw = clause.useRaw;

        if (useRaw) {
            whereClause.push(`${attribute} ${operator} ${value}`);
        } else {
            whereClause.push(`${attribute} ${operator} $${counter}`);
            params.push(value);
            counter++;
        }
    });

    let query = `
    DELETE FROM 
        ${table}
    WHERE 
        ${whereClause.join(' AND ')}
    RETURNING 
        ${returning.join(',')};`;

    try {
        result = await connection.query({
            text: query,
            values: params
        });
    } catch (error) {
        console.error('Error => db.deleteFromWhere()', error.message);
    }

    if (result && result.rows && result.rows.length > 0) {
        return result.rows;
    }

    return false;

}

async function selectFrom(fromTable, columns) {
    let result;

    let query = `
    SELECT
        ${columns.join(', ')}
    FROM
        ${fromTable};`;

    try {
        result = await connection.query(query);
    } catch (error) {
        console.error('Error => db.selectFrom()', error.message);
    }

    if (result && result.rows && result.rows.length > 0) {
        return result.rows;
    }

    return false;
}

/**
 * Select [columns] from [database].[table] [where] -> some condition(s) is true 
 * 
 * @param {String} fromTable from which table
 * @param {Array} columns which columns to select
 * @param {Array} inWhere where clause must be - > [{
        attribute: columname,
        operator: 'IS'/'='/etc.,
        value: number/string/boolean/null,
        useRaw: true/false  means insert into query as text
    }];
 */
async function selectFromWhere(fromTable, columns, inWhere, groupBy) {
    let where;
    let whereClause = [];
    let params = [];
    let counter = 1;
    let result;
    let groupByClause = '';

    if (groupBy) {
        groupByClause = `GROUP BY ${groupBy.join(', ')}`;
    }

    if (Array.isArray(inWhere)) {
        where = inWhere;
    } else {
        where = [{
            attribute: 'id',
            operator: '=',
            value: inWhere,
            useRaw: false
        }]
    }

    where.forEach(clause => {
        let attribute = clause.attribute;
        let operator = clause.operator;
        let value = clause.value;
        let useRaw = clause.useRaw;

        if (useRaw) {
            whereClause.push(`${attribute} ${operator} ${value}`);
        } else {
            whereClause.push(`${attribute} ${operator} $${counter}`);
            params.push(value);
            counter++;
        }
    });

    let query = `
    SELECT
        ${columns.join(', ')}
    FROM
        ${fromTable}
    WHERE
        ${whereClause.join(' AND ')}
    ${groupByClause};`;

    try {
        result = await connection.query({
            text: query,
            values: params
        });
    } catch (error) {
        console.error('Error => db.selectFrom()', error.message);
    }

    if (result && result.rows && result.rows.length > 0) {
        return result.rows;
    }

    return false;
}

module.exports = { query, insertValuesIntoTable, dropTable, updateValuesInTable, selectFrom, selectFromWhere, deleteFromWhere }