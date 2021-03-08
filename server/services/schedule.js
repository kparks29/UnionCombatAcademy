const { database } = require('../db/database')
const _ = require('lodash')
const Schedule = require('../models/schedule')

module.exports = class ScheduleService {
    constructor() { }

    async getScheduleById(id) {
        const sql = 'SELECT * FROM Schedules WHERE id=?;'
        const values = [id]

        try {
            let results = await database.query(sql, values) || []

            if (results && results.length > 0) {
                return new Schedule(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get schedule.' })
        }
    }

    async getSchedulesByProgramId(programId) {
        const sql = 'SELECT * FROM Schedules WHERE programId=? ORDER BY STR_TO_DATE(date, "%m-%d-%Y") ASC;'
        const values = [programId]

        try {
            let results = await database.query(sql, values) || []

            return results.map(schedule => new Schedule(schedule))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get schedule.' })
        }
    }

    async createSchedule(data) {
        const sql = 'INSERT INTO Schedules SET ?;'
        const values = [_.pickBy(data, _.identity)] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let schedule = await this.getScheduleById(data.id)

            if (!schedule) {
                return Promise.reject({ code: 500, message: 'Unable to get schedule after Creation.' })
            }

            return schedule
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create schedule.' })
        }
    }

    async updateSchedule(scheduleId, data) {
        const sql = 'UPDATE Schedules SET ? WHERE id=?;'
        const values = [_.pickBy(data, _.identity), scheduleId] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let schedule = await this.getScheduleById(scheduleId)

            if (!schedule) {
                return Promise.reject({ code: 500, message: 'Unable to get Schedules after Update.' })
            }

            return schedule
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to update Schedule.' })
        }
    }

    async deleteSchedule(scheduleId) {
        const sql = 'DELETE FROM Schedules WHERE id=?;'
        const values = [scheduleId]

        try {
            await database.query(sql, values)
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to delete Schedule.' })
        }
    }
}