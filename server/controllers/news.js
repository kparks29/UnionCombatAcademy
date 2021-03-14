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

        this.router.get('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR, ROLES.STUDENT), asyncHandler(this.getNews.bind(this)))
        this.router.post('/', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.createNews.bind(this)))
        this.router.put('/:newsId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.updateNews.bind(this)))
        this.router.delete('/:newsId', validToken, permissionCheck(ROLES.OWNER, ROLES.INSTRUCTOR), asyncHandler(this.deleteNews.bind(this)))
    }

    async getNews(req, res, next) {
        if (!req.query.programId || _.isEmpty(req.query.programId)) {
            return next({ code: 400, message: 'Unable to get news. Missing query param programId' })
        }

        let news = (await this.newsService.getNewsByProgramId(req.query.programId)).map(article => article.viewable)

        res.status(200).json({ news })
    }

    async createNews(req, res, next) {
        if (!req.body.programId || _.isEmpty(req.body.programId)) {
            return next({ code: 400, message: 'Unable to create news. Missing programId in body of request' })
        }

        let existingProgram = await this.programService.getProgramById(req.body.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.body.programId} exists.` })
        }

        let newNews = new News(Object.assign({}, req.body, {
            programId: req.body.programId,
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

    async updateNews(req, res, next) {
        if (!req.params.newsId || _.isEmpty(req.params.newsId)) {
            return next({ code: 400, message: 'Unable to update news. Missing newsId' })
        }

        let existingNews = await this.newsService.getNewsById(req.params.newsId)

        if (!existingNews) {
            return next({ code: 400, message: `No news with the newsId ${req.params.newsId} exists.` })
        }

        if (!req.body.programId || _.isEmpty(req.body.programId)) {
            return next({ code: 400, message: 'Unable to update news. Missing programId' })
        }

        let existingProgram = await this.programService.getProgramById(req.body.programId)

        if (!existingProgram) {
            return next({ code: 400, message: `No program with the programId ${req.body.programId} exists.` })
        }

        // _.pickBy ... _.identity removed null and undefined from object
        let updatedNews = new News(_.pickBy(
            Object.assign(
                {},
                existingNews,
                _.omit(req.body, ['id', 'programId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']),
                { updatedBy: req.user.id }
            ), _.identity)
        )
        updatedNews = _.omit(updatedNews, ['createdAt', 'updatedAt'])

        let errors = News.validate(updatedNews)
        if (errors) {
            return next({ code: 400, message: errors.join('. ') })
        }

        let news = (await this.newsService.updateNews(req.params.newsId, updatedNews)).viewable

        res.status(200).json({ news })
    }

    async deleteNews(req, res, next) {
        if (!req.params.newsId || _.isEmpty(req.params.newsId)) {
            return next({ code: 400, message: 'Unable to delete news. Missing newsId' })
        }

        if (!await this.newsService.getNewsById(req.params.newsId)) {
            return next({ code: 400, message: `Unable to delete news. News does not exist.` })
        }

        if (!req.query.programId || _.isEmpty(req.query.programId)) {
            return next({ code: 400, message: 'Unable to delete news. Missing programId' })
        }

        if (!await this.programService.getProgramById(req.query.programId)) {
            return next({ code: 400, message: `No program with the programId ${req.query.programId} exists.` })
        }

        await this.newsService.deleteNews(req.params.newsId)

        res.status(204).json({ message: 'Successfully deleted news' })
    }
}