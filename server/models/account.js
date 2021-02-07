const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Account {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.type = data.type
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }

    get viewable() {
        return {
            id: this.id,
            type: this.type,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            type: Joi.string().valid('free', 'premium').allow(null),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = Account.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}