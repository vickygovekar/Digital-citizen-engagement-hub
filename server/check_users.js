const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'civic_hub'
});
const promisePool = pool.promise();
(async () => {
    try {
        const [rows] = await promisePool.query('DESCRIBE issues');
        console.log('Table Structure:', JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
