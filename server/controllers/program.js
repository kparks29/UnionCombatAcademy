const { Router } = require('express')
const _ = require('lodash')
const { asyncHandler, validToken, permissionCheck, ROLES, restrictToOwnerOrHigher } = require('../helpers/helpers')
const Program = require('../models/program')
const Role = require('../models/role')
const AttendanceService = require('../services/attendance')
const ProgramService = require('../services/program')
const RoleService = require('../services/roles')
const UserService = require('../services/user')

module.exports = class ProgramController {
    constructor() {
        this.router = new Router()
        this.programService = new ProgramService()
        this.roleService = new RoleService()
        this.userService = new UserService()
        this.attendanceService = new AttendanceService()

        this.router.get('/', validToken, asyncHandler(this.getPrograms.bind(this)))
        this.router.get('/:programId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT), asyncHandler(this.getProgram.bind(this)))
        this.router.get('/:programId/users', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT), asyncHandler(this.getUsers.bind(this)))
        this.router.post('/', validToken, restrictToOwnerOrHigher, asyncHandler(this.createProgram.bind(this)))
        this.router.put('/:programId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.updateProgram.bind(this)))
        this.router.delete('/:programId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.deleteProgram.bind(this)))
    }


    async getPrograms(req, res, next) {
        let programs = (await this.programService.getProgramsByAccountId(req.account.id)).map(program => program.viewable)

        res.status(200).json({ programs })
    }

    async getProgram(req, res, next) {
        if (!req.params.programId || _.isEmpty(req.params.programId)) {
            return next({ code: 400, message: 'Unable to get program. Missing programId' })
        }

        let program = await this.programService.getProgramById(req.params.programId)

        if (!program) {
            return next({ code: 400, message: `Unable to get program. Could not find program with id ${req.params.programId}.` })
        }

        res.status(200).json({ program: program.viewable })
    }

    async getUsers(req, res, next) {
        if (!req.params.programId || _.isEmpty(req.params.programId)) {
            return next({ code: 400, message: 'Unable to get users. Missing programId' })
        }

        let attendance = {}

        let results = await this.attendanceService.getAttendanceByProgramId(req.params.programId) || []
        results.forEach(item => {
            if (!attendance[item.userId]) {
                attendance[item.userId] = [item.viewable]
            } else {
                attendance[item.userId].push(item.viewable)
            }
        })
        let users = (await this.userService.getUsersByProgramId(req.params.programId)).map(item => {
            let user = item.viewable
            user.attendance = attendance[user.id] || []
            return user
        })

        res.status(200).json({ users })
    }

    async createProgram(req, res, next) {
        let newProgram = new Program(Object.assign({}, req.body, {
            accountId: req.account.id
        }))
        let newRole = new Role({
            accountId: req.account.id,
            programId: newProgram.id,
            userId: req.user.id,
            role: 'owner'
        })

        let errors = []
        errors = errors.concat(Program.validate(newProgram))
        errors = errors.concat(Role.validate(newRole))
        errors = _.compact(errors)

        if (errors.length > 0) {
            return next({ code: 400, message: errors.join('. ') })
        }

        // Check for existing program on account
        if (await this.programService.getProgramNameAndAccountId(newProgram.name, req.account.id)) {
            return next({ code: 400, message: `Unable to create program. Program with the name ${newProgram.name} already exists.` })
        }

        let program = (await this.programService.createProgram(newProgram)).viewable
        let roles = (await this.roleService.createRole(newRole)).map(role => role.viewable)

        res.status(201).json({ program, roles })
    }

    async updateProgram(req, res, next) {
        if (!req.params.programId || _.isEmpty(req.params.programId)) {
            return next({ code: 400, message: 'Unable to update program. Missing programId' })
        }

        let existingProgram = await this.programService.getProgramById(req.params.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.params.programId} exists.` })
        }

        if (!_.isEmpty(req.body.name) && existingProgram.name !== req.body.name) {
            let otherProgram = await this.programService.getProgramNameAndAccountId(req.body.name, req.account.id)
            if (otherProgram) {
                return next({ code: 400, message: `Cannot update name as it already exists for another program in this account.` })
            }
        }

        // _.pickBy ... _.identity removed null and undefined from object
        let updatedProgram = new Program(_.pickBy(
            Object.assign(
                {}, 
                existingProgram, 
                _.omit(req.body, ['id', 'accountId', 'createdAt', 'updatedAt', 'deletedAt'])
            ), _.identity)
        )
        updatedProgram = _.omit(updatedProgram, ['createdAt', 'updatedAt', 'deletedAt'])

        let errors = Program.validate(updatedProgram)

        if (errors && errors.length > 0) {
            return next({ code: 400, message: _.compact(errors).join('. ') })
        }

        let program = (await this.programService.updateProgram(req.params.programId, updatedProgram)).viewable

        res.status(201).json({ program })
    }

    async deleteProgram(req, res, next) {
        if (!req.params.programId || _.isEmpty(req.params.programId)) {
            return next({ code: 400, message: 'Unable to delete program. Missing programId' })
        }

        if (!await this.programService.getProgramById(req.params.programId)) {
            return next({ code: 400, message: `Unable to delete program. Program does not exist.` })
        }

        await this.programService.deleteProgram(req.params.programId)

        res.status(204).json({ message: 'Successfully deleted program' })
    }
}