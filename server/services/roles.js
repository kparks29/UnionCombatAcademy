const { database } = require('../db/database')
const _ = require('lodash')
const Role = require('../models/role')

module.exports = class RoleService {
    constructor() { }

    async getRolesByUserId(userId) {
        const sql = 'SELECT * FROM Roles WHERE userId=?;'
        const values = [userId]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return results.map(result => new Role(result))
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get roles.' })
        }
    }

    async createRole(data) {
        const sql = 'INSERT INTO Roles SET ?;'
        const values = [_.pickBy(data, _.identity)]

        try {
            await database.query(sql, values)
            let roles = await this.getRolesByUserId(data.userId)

            if (!roles) {
                return Promise.reject({ code: 500, message: 'Unable to get Roles after Creation.' })
            }

            return roles
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create Role.' })
        }
    }
}