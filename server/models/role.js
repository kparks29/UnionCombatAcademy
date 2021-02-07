const Joi = require('@hapi/joi')
const uuid = require('uuid')

module.exports = class Role {
    constructor(data = {}) {
        this.id = data.id || uuid.v4()
        this.accountId = data.accountId
        this.programId = data.programId
        this.userId = data.userId
        this.role = data.role
    }

    get viewable() {
        return {
            id: this.id,
            accountId: this.accountId,
            programId: this.programId,
            userId: this.userId,
            role: this.role
        }
    }

    static get schema() {
        return Joi.object({
            id: Joi.uuid().allow(null),
            accountId: Joi.uuid().required(),
            programId: Joi.uuid().required(),
            userId: Joi.uuid().required(),
            role: Joi.string().valid('admin', 'owner', 'instructor', 'student').required()
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