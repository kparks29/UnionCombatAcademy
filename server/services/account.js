const { database } = require('../db/database')
const Account = require('../models/account')
const _ = require('lodash')

module.exports = class AccountService {
    constructor() {}

    async getAccountById(accountId) {
        const sql = 'SELECT * FROM Accounts WHERE id=?;'
        const values = [accountId]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return new Account(results[0])
            }

            return
        } catch(err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Account.' })
        }
    }

    async createAccount(data) {
        const sql = 'INSERT INTO Accounts SET ?;'
        const values = [_.pickBy(data, _.identity)]

        try {
            await database.query(sql, values)
            let account = await this.getAccountById(data.id)

            if (!account) {
                return Promise.reject({ code: 500, message: 'Unable to get Account after Creation.' })
            }

            return account
        } catch(err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create Account.' })
        }
    }
}