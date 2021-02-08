const { Router } = require('express')
const { asyncHandler } = require('../helpers/helpers')
const AccountService = require('../services/account')
const UserService = require('../services/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const RoleService = require('../services/roles')

module.exports = class AuthController {
    constructor() {
        this.router = new Router()
        this.userService = new UserService()
        this.accountService = new AccountService()
        this.roleService = new RoleService()

        this.router.post('/login', asyncHandler(this.login.bind(this)))
        this.router.post('/refresh', asyncHandler(this.refreshToken.bind(this)))
    }

    async login(req, res, next) {
        if (!req.body.hasOwnProperty('email') || req.body.email === '') {
            return next({ code: 400, message: 'Missing email in body of request.' })
        }

        if (!req.body.hasOwnProperty('password') || req.body.password === '') {
            return next({ code: 400, message: 'Missing password in body of request.' })
        }

        let user = await this.userService.getUserByEmail(req.body.email)

        if (!user || !bcrypt.compareSync(req.body.password, user.hashedPassword)) {
            return next({ code: 400, message: 'Unable to Login. Email or password is incorrect' })
        }

        let account = await this.accountService.getAccountById(user.accountId)
        let roles = (await this.roleService.getRolesByUserId(user.id)).map(role => role.viewable)

        const accessToken = jwt.sign({ account: account.viewable, user: user.viewable }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ account: account.viewable, user: user.viewable }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '30d' })

        res.status(201).json({ account: account.viewable, user: user.viewable, roles, accessToken, refreshToken })
    }

    async refreshToken(req, res, next) {
        if ((!req.headers['refresh-token'] || req.headers['refresh-token'] === '')) {
            return res.status(400).json({ error: 'Missing Authorization Header' })
        }

        try {
            let { user, account } = jwt.verify(req.headers['refresh-token'].replace('Bearer ', ''), process.env.REFRESH_TOKEN_SECRET_KEY)

            if (!user || !account) {
                console.log('Missing user or account in token')
                return res.status(401).json({ error: 'Invalid Token' })
            }

            const accessToken = jwt.sign({ account, user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' })
            const refreshToken = jwt.sign({ account, user }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '30d' })

            res.status(201).json({ accessToken, refreshToken })
        } catch (err) {
            console.log(err)
            return res.status(401).json({ error: 'Invalid or Expired Token' })
        }
    }
}