const Joi = require('@hapi/joi')

module.exports = class Account {
    constructor(data = {}) {
        this.id = data.id
        this.type = data.type
    }

    get viewable() {
        return {
            id: this.id,
            type: this.type
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.uuid().allow(null),
            type: Joi.string().valid('free', 'premium').allow(null)
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