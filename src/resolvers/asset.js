const Auth = require('../models/Auth');

async function getLocations(parent, args, { req }) {
    let params = [args.text.toLowerCase(), args.limit];

    let query = `
    SELECT 
        cities.id, cities.name || ', ' || countries.name AS value
    FROM 
        cities
    INNER JOIN states USING(id)
    INNER JOIN countries ON states.country_id = countries.id
    WHERE
        LOWER(cities.name) LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

async function getOccupations(parent, args, { req }) {
    if (!Auth.isUserAuthorised(req)) throw new Error(Auth.ERROR_NOT_AUTH);

    let params = [args.text.toLowerCase(), args.limit];

    let query = `
    SELECT 
	    id, name AS value
    FROM 
	    occupations
    WHERE
        LOWER(name)  LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

async function getIndustries(parent, args, { req }) {
    let params = [args.text.toLowerCase(), args.limit];

    let query = `
    SELECT 
	    id, name AS value
    FROM 
	    industries
    WHERE
        LOWER(name)  LIKE ($1 || '%')
    LIMIT $2;`;

    let result = await DB.incubate(query, params);

    if (!result) throw new Error('Error happened');

    return result;
}

module.exports = { getLocations, getOccupations, getIndustries }