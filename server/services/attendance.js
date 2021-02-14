const { database } = require('../db/database')
const Attendance = require('../models/attendance')
const _ = require('lodash')

module.exports = class AttendanceService {
    constructor() { }

    async getAttendanceById(id) {
        const sql = 'SELECT * FROM Attendance WHERE id=?;'
        const values = [id]

        try {
            let results = await database.query(sql, values) || []

            if (results && results.length > 0) {
                return new Attendance(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get attendance.' })
        }
    }

    async getAttendanceByProgramId(programId) {
        const sql = 'SELECT * FROM Attendance WHERE programId=?;'
        const values = [programId]

        try {
            let results = await database.query(sql, values) || []

            return results.map(attendance => new Attendance(attendance))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get attendance.' })
        }
    }

    async createAttendance(data) {
        const sql = 'INSERT INTO Attendance SET ?;'
        const values = [_.pickBy(data, _.identity)] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let attendance = await this.getAttendanceById(data.id)

            if (!attendance) {
                return Promise.reject({ code: 500, message: 'Unable to get Attendance after Creation.' })
            }

            return attendance
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create Attendance.' })
        }
    }
}