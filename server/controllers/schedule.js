const { Router } = require('express')
const { asyncHandler, validToken, permissionCheck, ROLES } = require('../helpers/helpers')
const _ = require('lodash')
const Schedule = require('../models/schedule')
const ScheduleService = require('../services/schedule')
const ProgramService = require('../services/program')

module.exports = class ScheduleController {
    constructor() {
        this.router = new Router()
        this.scheduleService = new ScheduleService()
        this.programService = new ProgramService()

        this.router.get('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT), asyncHandler(this.getSchedules.bind(this)))
        this.router.post('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.createSchedule.bind(this)))
        this.router.put('/:scheduleId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.updateSchedule.bind(this)))
        this.router.delete('/:scheduleId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.deleteSchedule.bind(this)))
    }

    async getSchedules(req, res, next) {
        if (!req.query.programId || _.isEmpty(req.query.programId)) {
            return next({ code: 400, message: 'Unable to get schedule. Missing query param programId' })
        }

        let schedules = (await this.scheduleService.getSchedulesByProgramId(req.query.programId)).map(schedule => schedule.viewable)

        res.status(200).json({ schedules })
    }

    async createSchedule(req, res, next) {
        if (!req.body.programId || _.isEmpty(req.body.programId)) {
            return next({ code: 400, message: 'Unable to create schedule. Missing body param programId' })
        }

        let existingProgram = await this.programService.getProgramById(req.body.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.body.programId} exists.` })
        }

        let newSchedule = new Schedule(Object.assign({}, req.body, {
            createdBy: req.user.id,
            updatedBy: req.user.id
        }))

        let errors = Schedule.validate(newSchedule)
        if (errors) {
            return next({ code: 400, message: errors.join('. ') })
        }

        let schedule = (await this.scheduleService.createSchedule(newSchedule)).viewable

        res.status(201).json({ schedule })
    }

    async updateSchedule(req, res, next) {
        if (!req.params.scheduleId || _.isEmpty(req.params.scheduleId)) {
            return next({ code: 400, message: 'Unable to update schedule. Missing scheduleId' })
        }

        let existingSchedule = await this.scheduleService.getScheduleById(req.params.scheduleId)

        if (!existingSchedule) {
            return next({ code: 400, message: `No schedule with the scheduleId ${req.params.scheduleId} exists.` })
        }

        if (!req.body.programId || _.isEmpty(req.body.programId)) {
            return next({ code: 400, message: 'Unable to update schedule. Missing programId' })
        }

        let existingProgram = await this.programService.getProgramById(req.body.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.body.programId} exists.` })
        }

        // _.pickBy ... _.identity removed null and undefined from object
        let updatedSchedule = new Schedule(_.pickBy(
            Object.assign(
                {},
                existingSchedule,
                _.omit(req.body, ['id', 'programId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']),
                { updatedBy: req.user.id }
            ), _.identity)
        )
        updatedSchedule = _.omit(updatedSchedule, ['createdAt', 'updatedAt'])

        let errors = Schedule.validate(updatedSchedule)
        if (errors) {
            return next({ code: 400, message: errors.join('. ') })
        }

        let schedule = (await this.scheduleService.updateSchedule(req.params.scheduleId, updatedSchedule)).viewable

        res.status(200).json({ schedule })
    }

    async deleteSchedule(req, res, next) {
        if (!req.params.scheduleId || _.isEmpty(req.params.scheduleId)) {
            return next({ code: 400, message: 'Unable to delete schedule. Missing scheduleId' })
        }

        if (!await this.scheduleService.getScheduleById(req.params.scheduleId)) {
            return next({ code: 400, message: `Unable to delete schedule. Schedule does not exist.` })
        }

        if (!req.query.programId || _.isEmpty(req.query.programId)) {
            return next({ code: 400, message: 'Unable to delete schedule. Missing programId' })
        }

        if (!await this.programService.getProgramById(req.query.programId)) {
            return next({ code: 400, message: `No program with the programId ${req.query.programId} exists.` })
        }

        await this.scheduleService.deleteSchedule(req.params.scheduleId)

        res.status(204).json({ message: 'Successfully deleted schedule' })
    }
}