const { Router } = require('express')
const _ = require('lodash')
const { asyncHandler, validToken, ownerOnly } = require('../helpers/helpers')
const Program = require('../models/program')
const Role = require('../models/role')
const ProgramService = require('../services/program')
const RoleService = require('../services/roles')

module.exports = class ProgramController {
    constructor() {
        this.router = new Router()
        this.programService = new ProgramService()
        this.roleService = new RoleService()

        this.router.post('/', validToken, ownerOnly, asyncHandler(this.createProgram.bind(this)))
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