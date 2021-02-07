const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Attendance {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.programId = data.programId
        this.userId = data.userId
        this.beltColor = data.beltColor
        this.stripeCount = data.stripeCount
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }

    get viewable() {
        return {
            id: this.id,
            programId: this.programId,
            userId: this.userId,
            beltColor: this.beltColor,
            stripeCount: this.stripeCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            programId: Joi.string().uuid().required(),
            userId: Joi.string().uuid().required(),
            beltColor: Joi.string().required(),
            stripeCount: Joi.number().required(),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = Attendance.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}