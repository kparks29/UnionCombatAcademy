const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Schedule {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.programId = data.programId
        this.day = data.day
        this.start = data.start
        this.end = data.end
        this.description = data.description
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.createdBy = data.createdBy
        this.updatedBy = data.updatedBy
    }

    get viewable() {
        return {
            id: this.id,
            programId: this.programId,
            day: this.day,
            start: this.start,
            end: this.end,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            programId: Joi.string().uuid().required(),
            day: Joi.string().required(),
            start: Joi.string().required(),
            end: Joi.string().required(),
            description: Joi.string().allow(null),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null),
            createdBy: Joi.string().uuid().allow(null),
            updatedBy: Joi.string().uuid().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = Schedule.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}