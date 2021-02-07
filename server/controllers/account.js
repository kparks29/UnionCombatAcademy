const { Router } = require('express')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { asyncHandler } = require('../helpers/helpers')
const Account = require('../models/account')
const Program = require('../models/program')
const User = require('../models/user')
const AccountService = require('../services/account')
const UserService = require('../services/user')
const ProgramService = require('../services/program')

module.exports = class AccountController {
    constructor() {
        this.router = new Router()
        this.accountService = new AccountService()
        this.userService = new UserService()
        this.programService = new ProgramService

        this.router.post('/', asyncHandler(this.register.bind(this)))
    }

    async register(req, res, next) {
        let errors = []

        if (_.isEmpty(_.get(req, 'body.password'))) {
            return next({ code: 400, message: 'Missing Password' })
        } else if (!User.passwordRegex.test(req.body.password)) {
            return next({ code: 400, message: 'Password must be a minimum 6 characters, have at least one uppercase letter, one lowercase letter, one number and one special character' })
        }

        let salt = bcrypt.genSaltSync(10)
        let newAccount = new Account(req.body)
        let newUser = new User(Object.assign({
            accountId: newAccount.id,
            hashedPassword: bcrypt.hashSync(req.body.password, salt),
            salt
        }, req.body))
        let newProgram = new Program(Object.assign({
            accountId: newAccount.id
        }, req.body))
        
        errors = errors.concat(Account.validate(newAccount))
        errors = errors.concat(User.validate(newUser))
        errors = errors.concat(Program.validate(newProgram))
        errors = _.compact(errors)
        
        if (errors.length > 0) {
            return next({ code: 400, message: errors.join('. ') })
        }

        // Check for existing user
        if (await this.userService.getUserByEmail(newUser.email)) {
            return next({ code: 400, message: `Unable to create account. User with the email ${newUser.email} already exists.` })
        }

        let account = (await this.accountService.createAccount(newAccount)).viewable
        let user = (await this.userService.createUser(newUser)).viewable
        let program = (await this.programService.createProgram(newProgram)).viewable

        const accessToken = jwt.sign({ account, user, program }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ account, user, program }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '30d' })

        res.status(201).json({ account, user, program, accessToken, refreshToken })
    }
}