const { Router } = require('express')
const { asyncHandler, validToken, adminOnly, hasPermission, allowedUserTypes } = require('../helpers/helpers')

module.exports = class UserController {
    constructor() {
        this.router = new Router()

        // this.router.get('/', asyncHandler(this.getUsers.bind(this))) // get list of users for program
        // this.router.post('/', asyncHandler(this.registerUser.bind(this))) // creates a user
        // this.router.post('/forgot', asyncHandler(this.forgotPassword.bind(this)))
        // this.router.post('/reset', asyncHandler(this.activateUser.bind(this)))
        // this.router.put('/:user_id', asyncHandler(this.resetPassword.bind(this)))
    }
}