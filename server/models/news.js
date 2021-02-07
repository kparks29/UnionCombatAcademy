const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class News {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.programId = data.programId
        this.title = data.title
        this.message = data.message
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.createdBy = data.createdBy
        this.updatedBy = data.updatedBy
    }

    get viewable() {
        return {
            id: this.id,
            programId: this.programId,
            title: this.title,
            message: this.message,
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
            title: Joi.string().required(),
            message: Joi.string().required(),
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