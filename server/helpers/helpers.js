const jwt = require('jsonwebtoken')
const _ = require('lodash')

class Helper {
    constructor() {
    }
}

const helper = new Helper()

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ status: 1, error: 'Unauthorized' })
    }

    next()
}

// double arrow funciton just is a funciton that returns a function
const asyncHandler = fn => (...args) => {
    const fnReturn = fn(...args) // creating a function with the secondary function arguments
    const next = args[args.length - 1] // the last argument is express router is next
    return Promise.resolve(fnReturn).catch(next) // return promise of values
}

// error handler for application
const errorHandler = (error, req, res, next) => {
    console.log(error)
    if (typeof error === 'object') {
        res.status(error.code).json({ status: 1, error: error.message })
    } else {
        res.status(400).json({ status: 1, error })
    }
}

const validToken = async (req, res, next) => {
    if ((!req.headers['authorization'] || req.headers['authorization'] === '')) {
        return res.status(400).json({ status: 1, error: 'Missing Authorization Header' })
    }

    try {
        let { user } = jwt.verify(req.headers['authorization'].replace('Bearer ', ''), process.env.TOKEN_SECRET_KEY)

        if (!user) {
            return res.status(401).json({ status: 1, error: 'Invalid Token' })
        }

        req.user = user
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ status: 1, error: 'Invalid Token' })
    }
}

const allowedUserTypes = (...userTypes) => {
    return (req, res, next) => {
        if (!userTypes.includes(req.user.role) && req.user.role !== 'admin') {
            return next({ code: 403, message: 'Unauthorized. User type is not allowed to make this request.' })
        }

        next()
    }
}

module.exports = {
    adminOnly,
    allowedUserTypes,
    asyncHandler,
    errorHandler,
    validToken
}