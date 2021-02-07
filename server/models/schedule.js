const Joi = require('@hapi/joi')

module.exports = class Schedule {
    constructor(data = {}) {
        this.id = data.id
        this.programId = data.programId
        this.date = data.date
        this.start = data.start
        this.end = data.end
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.createdBy = data.createdBy
        this.updatedBy = data.updatedBy
    }

    get viewable() {
        return {
            id: this.id,
            programId: this.programId,
            date: this.date,
            start: this.start,
            end: this.end,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.uuid().allow(null),
            programId: Joi.uuid().required(),
            date: Joi.string().required(),
            start: Joi.string().required(),
            end: Joi.string().required(),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null),
            createdBy: Joi.uuid().allow(null),
            updatedBy: Joi.uuid().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = User.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}