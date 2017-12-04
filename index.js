const mysql2 = require('mysql2');

const RETRY_COUNT = 10;
const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 3,
});

module.exports = {
  query(arg0, arg1) {
    return new Promise((resolve, reject) => {
      function task(errCount) {
        try {
          pool.query(arg0, arg1, (err, result) => {
            if (!err) resolve(result);
            else if (err.code === 'ER_PARSE_ERROR' || errCount > RETRY_COUNT) reject(err);
            else setTimeout(task.bind(null, errCount + 1), 3000);
          });
        } catch (e) {
          if (errCount > RETRY_COUNT) reject(e);
          else setTimeout(task.bind(null, errCount + 1), 3000);
        }
      }
      task(0);
    });
  },
};
