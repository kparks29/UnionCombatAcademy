const { Router } = require('express')
const bcrypt = require('bcryptjs')
const Password = require('secure-random-password')
const _ = require('lodash')
const { asyncHandler, validToken, permissionCheck, ROLES } = require('../helpers/helpers')
const { mailer, TEMPLATES } = require('../helpers/mailer')
const UserService = require('../services/user')
const ProgramService = require('../services/program')
const User = require('../models/user')
const Role = require('../models/role')
const RoleService = require('../services/roles')

module.exports = class UserController {
    constructor() {
        this.router = new Router()
        this.userService = new UserService()
        this.programService = new ProgramService()
        this.roleService = new RoleService()

        // this.router.get('/', asyncHandler(this.getUsers.bind(this))) // get list of users for program
        // this.router.post('/', asyncHandler(this.registerUser.bind(this))) // creates a user
        // this.router.post('/forgot', asyncHandler(this.forgotPassword.bind(this)))
        // this.router.post('/reset', asyncHandler(this.activateUser.bind(this)))
        // this.router.put('/:user_id', asyncHandler(this.resetPassword.bind(this)))
        
        this.router.post('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.createUser.bind(this)))
        this.router.post('/:userId/programs/:programId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.addUserToProgram.bind(this)))
    }

    async hasPermission(role, programId, roles) {
        let hasPermission = false

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].role === ROLES.ADMIN) {
                hasPermission = true
                break
            }

            if (roles[i].programId === programId) {
                if (roles[i].role === ROLES.OWNER && [ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT].includes(role)) {
                    hasPermission = true
                    break
                } else if (roles[i].role === ROLES.INSTRUCTOR && [ROLES.INSTRUCTOR, ROLES.STUDENT].includes(role)) {
                    hasPermission = true
                    break
                }
            }
        }

        return hasPermission
    }

    async addUserToProgram(req, res, next) {
        let newRole = new Role({
            accountId: req.account.id,
            programId: req.params.programId,
            userId: req.params.userId,
            role: req.body.role
        })

        let errors = Role.validate(newRole)

        if (errors && errors.length > 0) {
            return next({ code: 400, message: _.compact(errors).join('. ') })
        }

        // Check for existing role
        let existingRoles = await this.roleService.getRolesByUserId(req.params.userId)
        for (let i=0; i<existingRoles.length; i++) {
            if (existingRoles[i].programId === req.params.programId) {
                return next({ code: 400, message: `Unable to add user to program. User already belongs to program.` })
            }
        }

        // Check if user is trying to make higher elevated user
        if (!this.hasPermission(newRole.role, req.params.programId, req.roles)) {
            return next({ code: 403, message: 'Unauthorized. User type is not allowed to make this request.' })
        }

        let roles = (await this.roleService.createRole(newRole)).map(role => role.viewable)
        res.status(201).json({ roles })
    }

    async createUser(req, res, next) {
        let password = Password.randomPassword({ length: 6, characters: [Password.digits, Password.lower, Password.upper, Password.symbols] })
        let salt = bcrypt.genSaltSync(10)

        let newUser = new User(Object.assign({
            hashedPassword: bcrypt.hashSync(password, salt),
            salt
        }, req.body))
        let newRole = new Role({
            accountId: newUser.accountId,
            programId: req.body.programId,
            userId: newUser.id,
            role: req.body.role
        })

        let errors = User.validate(newUser)

        if (errors && errors.length > 0) {
            return next({ code: 400, message: _.compact(errors).join('. ') })
        }

        if (!req.body.programId || req.body.programId === '') {
            return next({ code: 400, message: `Unable to create user. Missing Program Id in body of request.` })
        }

        let program = await this.programService.getProgramById(req.body.programId)
        
        if (!program) {
            return next({ code: 400, message: `Unable to create user. Program does not exist.` })
        }

        // Check for existing user
        if (await this.userService.getUserByEmail(newUser.email)) {
            return next({ code: 400, message: `Unable to create account. User with the email ${newUser.email} already exists.` })
        }

        // Check if user is trying to make higher elevated user
        if (!this.hasPermission(newRole.role, program.id, req.roles)) {
            return next({ code: 403, message: 'Unauthorized. User type is not allowed to make this request.' })
        }

        let user = (await this.userService.createUser(newUser)).viewable
        let roles = (await this.roleService.createRole(newRole)).map(role => role.viewable)

        await mailer.sendTemplate(null, user.email, 'Welcome to Union Combat Academy', TEMPLATES.userCreated, {
            firstName: user.firstName,
            lastName: user.lastName,
            password,
            url: `${process.env.BASE_URL}/login`
        })

        res.status(201).json({ user, roles })
    }
}