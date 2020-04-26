const Auth = require('../models/Auth');

async function getLocations(parent, args, { req }) {
    let params = [args.text, args.limit];

    let query = `
    SELECT 
        cities.id, cities.name || ', ' || states.name AS value
    FROM 
        cities
    INNER JOIN 
        states USING(id)
    WHERE
        cities.name  LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

async function getOccupations(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error(Auth.ERROR_NOT_AUTH);

    let params = [args.text, args.limit];

    let query = `
    SELECT 
	    id, name AS value
    FROM 
	    occupations
    WHERE
        name  LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

async function getIndustries(parent, args, { req }) {
    let params = [args.text, args.limit];

    let query = `
    SELECT 
	    id, name AS value
    FROM 
	    industries
    WHERE
        name  LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

module.exports = { getLocations, getOccupations, getIndustries }