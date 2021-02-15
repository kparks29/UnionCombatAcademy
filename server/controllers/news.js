const { Router } = require('express')
const { asyncHandler, validToken, permissionCheck, ROLES } = require('../helpers/helpers')
const _ = require('lodash')
const News = require('../models/news')
const NewsService = require('../services/news')
const ProgramService = require('../services/program')

module.exports = class NewsController {
    constructor() {
        this.router = new Router()
        this.newsService = new NewsService()
        this.programService = new ProgramService()

        this.router.post('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.createNews.bind(this)))
    }

    async createNews(req, res, next) {
        if (!req.query.programId || _.isEmpty(req.query.programId)) {
            return next({ code: 400, message: 'Unable to create news. Missing query param programId' })
        }

        let existingProgram = await this.programService.getProgramById(req.query.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.query.programId} exists.` })
        }

        let newNews = new News(Object.assign({}, req.body, {
            programId: req.query.programId,
            createdBy: req.user.id,
            updatedBy: req.user.id
        }))

        let errors = News.validate(newNews)
        if (errors) {
            return next({ code: 400, message: errors.join('. ') })
        }

        let news = (await this.newsService.createNews(newNews)).viewable

        res.status(201).json({ news })
    }
}