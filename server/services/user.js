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

    async getUsersByProgramId(programId) {
        const sql = `SELECT u.* FROM Users AS u
            LEFT JOIN Roles AS r ON u.id=r.userId
            WHERE r.programId=? AND u.deletedAt IS NULL;`
        const values = [programId]

        try {
            let results = await database.query(sql, values)

            return results.map(user => new User(user))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Users.' })
        }
    }

    async getUsersByAccountId(accountId) {
        const sql = 'SELECT * FROM Users WHERE accountId=? AND deletedAt IS NULL;'
        const values = [accountId]

        try {
            let results = await database.query(sql, values)

            return results.map(user => new User(user))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Users.' })
        }
    }

    async createUser(data) {
        const sql = 'INSERT INTO Users SET ?;'
        const values = [_.pickBy(data, _.identity)] // _.pickBy ... _.identity removed null and undefined from object

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

    async updateUser(userId, data) {
        const sql = 'UPDATE Users SET ? WHERE id=?;'
        const values = [_.pickBy(data, _.identity), userId] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let user = await this.getUserById(userId)

            if (!user) {
                return Promise.reject({ code: 500, message: 'Unable to get User after Update.' })
            }

            return user
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to update User.' })
        }
    }

    async deleteUser(userId) {
        const sql = 'UPDATE Users SET deletedAt=NOW() WHERE id=?;'
        const values = [userId]

        try {
            await database.query(sql, values)
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to update User.' })
        }
    }
}