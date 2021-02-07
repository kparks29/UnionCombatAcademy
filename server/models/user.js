const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class User {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.accountId = data.accountId
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.email = data.email
        this.beltColor = data.beltColor
        this.stripeCount = data.stripeCount
        this.canRankUp = data.canRankUp
        this.hashedPassword = data.hashedPassword
        this.salt = data.salt
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.deletedAt = data.deletedAt
    }

    get viewable() {
        return {
            id: this.id,
            accountId: this.accountId,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            beltColor: this.beltColor,
            stripeCount: this.stripeCount,
            canRankUp: this.canRankUp,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            accountId: Joi.string().uuid().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            beltColor: Joi.string().required(),
            stripeCount: Joi.number().required(),
            hashedPassword: Joi.string(),
            salt: Joi.string(),
            canRankUp: Joi.boolean(),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null),
            deletedAt: Joi.date().iso().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = User.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }

    static get passwordRegex() {
        return new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$', 'g')
    }
}