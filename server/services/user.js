const { database } = require('../db/database')
const User = require('../models/user')
const _ = require('lodash')

module.exports = class UserService {
    constructor() { }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM Users WHERE email=?;'
        const values = [email]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return new User(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get User.' })
        }
    }

    async getUserById(userId) {
        const sql = 'SELECT * FROM Users WHERE id=?;'
        const values = [userId]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return new User(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get User.' })
        }
    }

    async createUser(data) {
        const sql = 'INSERT INTO Users SET ?;'
        const values = [_.pickBy(data, _.identity)]

        try {
            await database.query(sql, values)
            let user = await this.getUserById(data.id)

            if (!user) {
                return Promise.reject({ code: 500, message: 'Unable to get User after Creation.' }) 
            }

            return user
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create User.' })
        }
    }
}