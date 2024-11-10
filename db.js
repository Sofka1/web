const Pool = require('pg').Pool

const pool = new Pool({
    user: "sofkai719g",
    password: 'zLIs4At5nEnj',
    host: "pg3.sweb.ru",
    port: 5432,
    database: "sofkai719g"
});

module.exports = pool