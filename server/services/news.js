const { database } = require('../db/database')
const _ = require('lodash')
const News = require('../models/news')

module.exports = class NewsService {
    constructor() { }

    async getNewsById(id) {
        const sql = 'SELECT * FROM News WHERE id=?;'
        const values = [id]

        try {
            let results = await database.query(sql, values) || []

            if (results && results.length > 0) {
                return new News(results[0])
            }

            return
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get news.' })
        }
    }

    async getNewsByProgramId(programId) {
        const sql = 'SELECT * FROM News WHERE programId=?;'
        const values = [programId]

        try {
            let results = await database.query(sql, values) || []

            return results.map(news => new News(news))
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to get news.' })
        }
    }

    async createNews(data) {
        const sql = 'INSERT INTO News SET ?;'
        const values = [_.pickBy(data, _.identity)] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let news = await this.getNewsById(data.id)

            if (!news) {
                return Promise.reject({ code: 500, message: 'Unable to get News after Creation.' })
            }

            return news
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to create News.' })
        }
    }

    async updateNews(newsId, data) {
        const sql = 'UPDATE News SET ? WHERE id=?;'
        const values = [_.pickBy(data, _.identity), newsId] // _.pickBy ... _.identity removed null and undefined from object

        try {
            await database.query(sql, values)
            let news = await this.getNewsById(newsId)

            if (!news) {
                return Promise.reject({ code: 500, message: 'Unable to get News after Update.' })
            }

            return news
        } catch (err) {
            console.log(err)
            if (typeof err === 'object') {
                return Promise.reject(err)
            }

            return Promise.reject({ code: 500, message: 'Unable to update News.' })
        }
    }

    async deleteNews(newsId) {
        const sql = 'DELETE FROM News WHERE id=?;'
        const values = [newsId]

        try {
            await database.query(sql, values)
        } catch (err) {
            console.log(err)
            return Promise.reject({ code: 500, message: 'Unable to delete News.' })
        }
    }
}