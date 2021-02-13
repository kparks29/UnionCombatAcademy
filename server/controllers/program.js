const { Router } = require('express')
const _ = require('lodash')
const { asyncHandler, validToken, ownerOnly, permissionCheck, ROLES } = require('../helpers/helpers')
const Program = require('../models/program')
const Role = require('../models/role')
const ProgramService = require('../services/program')
const RoleService = require('../services/roles')

module.exports = class ProgramController {
    constructor() {
        this.router = new Router()
        this.programService = new ProgramService()
        this.roleService = new RoleService()

        this.router.get('/', validToken, asyncHandler(this.getPrograms.bind(this)))
        this.router.get('/:programId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT), asyncHandler(this.getProgram.bind(this)))
        this.router.post('/', validToken, ownerOnly, asyncHandler(this.createProgram.bind(this)))
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
}