const { Router } = require('express')
const { asyncHandler, validToken, permissionCheck, ROLES } = require('../helpers/helpers')
const ProgramService = require('../services/program')
const UserService = require('../services/user')
const AttendanceService = require('../services/attendance')
const _ = require('lodash')
const Attendance = require('../models/attendance')

module.exports = class AttendanceController {
    constructor() {
        this.router = new Router()
        this.userService = new UserService()
        this.programService = new ProgramService()
        this.attendanceService = new AttendanceService()

        this.router.post('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.createAttendance.bind(this)))
    }

    async createAttendance(req, res, next) {
        if (!req.body.userId || _.isEmpty(req.body.userId)) {
            return next({ code: 400, message: 'Unable to check in user. Missing userId' })
        }

        if (!req.body.programId || _.isEmpty(req.body.programId)) {
            return next({ code: 400, message: 'Unable to check in user. Missing program' })
        }

        let user = await this.userService.getUserById(req.body.userId)
        if (!user) {
            return next({ code: 400, message: `Unable to check in user. User does not exist.` })
        }

        if (!await this.programService.getProgramById(req.body.programId)) {
            return next({ code: 400, message: `Unable to check in user. Program does not exist.` })
        }

        let newAttendance = new Attendance({
            programId: req.body.programId,
            userId: user.id,
            beltColor: user.beltColor,
            stripeCount: user.stripeCount
        })

        let attendance = await this.attendanceService.createAttendance(newAttendance)

        res.status(201).json({ attendance })
    }
}