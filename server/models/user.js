const Joi = require('@hapi/joi')

module.exports = class User {
    constructor(data = {}) {
        this.id = data.id
        this.accountId = data.accountId
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.email = data.email
        this.beltColor = data.beltColor
        this.stripeCount = data.stripeCount
        this.canRankUp = data.canRankUp
        this.hashedPassword = data.hashedPassword
        this.salt = data.salt
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
            deletedAt: this.deletedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.uuid().allow(null),
            accountId: Joi.uuid().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            beltColor: Joi.string().required(),
            stripeCount: Joi.number().required(),
            canRankUp: Joi.boolean(),
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
}