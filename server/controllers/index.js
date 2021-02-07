const { Router } = require('express')

const AccountController = require('./account')
const AttendanceController = require('./attendance')
const NewsController = require('./news')
const ProgramController = require('./program')
const ScheduleController = require('./schedule')
const UserController = require('./user')

class V1Router {
    constructor() {
        this.router = new Router()
        this.router.use('/accounts', new AccountController().router)
        this.router.use('/attendance', new AttendanceController().router)
        this.router.use('/news', new NewsController().router)
        this.router.use('/programs', new ProgramController().router)
        this.router.use('/schedules', new ScheduleController().router)
        this.router.use('/users', new UserController().router)
    }
}

module.exports = {
    V1Router
}