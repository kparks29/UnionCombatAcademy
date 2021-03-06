const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Program {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.accountId = data.accountId
        this.name = data.name
        this.description = data.description
        this.cycleCount = data.cycleCount
        this.cycleType = data.cycleType
        this.attendancePerCycle = data.attendancePerCycle
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.deletedAt = data.deletedAt
    }

    get viewable() {
        return {
            id: this.id,
            accountId: this.accountId,
            name: this.name,
            description: this.description,
            cycleCount: this.cycleCount,
            cycleType: this.cycleType,
            attendancePerCycle: this.attendancePerCycle,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            accountId: Joi.string().uuid().required(),
            name: Joi.string().required(),
            description: Joi.string(),
            cycleCount: Joi.number().required(),
            cycleType: Joi.string().valid('years', 'months', 'weeks', 'days').required(),
            attendancePerCycle: Joi.number().required(),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null),
            deletedAt: Joi.date().iso().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = Program.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}