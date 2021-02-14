const { database } = require('../db/database')
const Program = require('../models/program')
const _ = require('lodash')

module.exports = class ProgramService {
    constructor() { }

    async getProgramsByAccountId(accountId) {
        const sql = 'SELECT * FROM Programs WHERE accountId=? AND deletedAt IS NULL;'
        const values = [accountId]

        try {
            let results = await database.query(sql, values) || []

            return results.map(program => new Program(program))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Program.' })
        }
    }

    async getProgramNameAndAccountId(programName, accountId) {
        const sql = 'SELECT * FROM Programs WHERE name=? AND accountId=?;'
        const values = [programName, accountId]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return new Program(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Program.' })
        }
    }

    async getProgramById(programId) {
        const sql = 'SELECT * FROM Programs WHERE id=? AND deletedAt IS NULL;'
        const values = [programId]

        try {
            let results = await database.query(sql, values)

            if (results && results.length > 0) {
                return new Program(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get Program.' })
        }
    }

    async createProgram(data) {
        const sql = 'INSERT INTO Programs SET ?;'
        const values = [_.pickBy(data, _.identity)] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let program = await this.getProgramById(data.id)

            if (!program) {
                return Promise.reject({ code: 500, message: 'Unable to get Program after Creation.' })
            }

            return program
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create Program.' })
        }
    }

    async updateProgram(programId, data) {
        const sql = 'UPDATE Programs SET ? WHERE id=?;'
        const values = [_.pickBy(data, _.identity), programId] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let program = await this.getProgramById(programId)

            if (!program) {
                return Promise.reject({ code: 500, message: 'Unable to get Program after Update.' })
            }

            return program
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to update Program.' })
        }
    }

    async deleteProgram(programId) {
        const sql = 'UPDATE Programs SET deletedAt=NOW() WHERE id=?;'
        const values = [programId]

        try {
            await database.query(sql, values)
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to delete Program.' })
        }
    }
}