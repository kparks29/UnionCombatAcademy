const { createPool } = require('mysql2')

class Database {
    constructor() {
        this.pool = createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            typeCast: (field, next) => {
                if (field.type === 'TINY' && field.length === 1) {
                    return (field.string() === '1') // 1 = true, 0 = false
                } else {
                    return next()
                }
            }
        })
    }

    query(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.log('Unable to get database connection.', err)
                    return reject('Unable to get database connection.')
                }

                connection.beginTransaction(err => {
                    if (err) {
                        console.log('Unable to get begin transaction.', err)
                        return reject('Unable to get begin transaction.')
                    }

                    connection.query(sql, values, (err, results) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release()
                                console.log('Error querying database.', err, sql)
                                return reject('Error querying database.')
                            })
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(function () {
                                    connection.release()
                                    console.log('Error committing transaction.', err)
                                    return reject('Error committing transaction.')
                                });
                            }

                            resolve(results)
                            connection.release()
                        });
                    })
                })
            })
        })
    }
}

module.exports = {
    database: new Database()
}