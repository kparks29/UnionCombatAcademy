const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Role {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.accountId = data.accountId
        this.programId = data.programId
        this.userId = data.userId
        this.role = data.role
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }

    get viewable() {
        return {
            id: this.id,
            accountId: this.accountId,
            programId: this.programId,
            userId: this.userId,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.string().uuid().allow(null),
            accountId: Joi.string().uuid().required(),
            programId: Joi.string().uuid().required(),
            userId: Joi.string().uuid().required(),
            role: Joi.string().valid('admin', 'owner', 'instructor', 'student').required(),
            createdAt: Joi.date().iso().allow(null),
            updatedAt: Joi.date().iso().allow(null)
        })
    }

    static validate(user) {
        let { error, value } = Role.schema.validate(user)
        if (error) {
            error = error.details.map(detail => detail.message)
        }
        return error
    }
}