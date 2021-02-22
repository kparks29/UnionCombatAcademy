const jwt = require('jsonwebtoken')
const RoleService = require('../services/roles')
const roleService = new RoleService()
const ROLES = {
    ADMIN: 'admin',
    OWNER: 'owner',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
}

const restrictToAdmin = (req, res, next) => {
    let isAdmin = false
    let roles = req.roles || []

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === ROLES.ADMIN) {
            isAdmin = true
            break
        }
    }

    if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized. User type is not allowed to make this request.' })
    }

    next()
}

const restrictToOwnerOrHigher = (req, res, next) => {
    let isAdmin = false
    let isOwner = false
    let roles = req.roles || []

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === ROLES.ADMIN) {
            isAdmin = true
            break
        } else if (roles[i].role === ROLES.OWNER) {
            isAdmin = true
            break
        }
    }

    if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Unauthorized. User type is not allowed to make this request.' })
    }

    next()
}

const restrictToInstructorOrHigher = (req, res, next) => {
    let hasRole = false
    let roles = req.roles || []

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === ROLES.ADMIN) {
            hasRole = true
            break
        } else if (roles[i].role === ROLES.OWNER) {
            hasRole = true
            break
        } else if (roles[i].role === ROLES.INSTRUCTOR) {
            hasRole = true
            break
        }
    }

    if (!hasRole) {
        return res.status(403).json({ error: 'Unauthorized. User type is not allowed to make this request.' })
    }

    next()
}

const hasRoles = (roles, expectedRoles)  => {
    let hasRole = false

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === ROLES.ADMIN) {
            hasRole = true
            break
        } else if (expectedRoles.includes(roles[i].role)) {
            hasRole = true
            break
        }
    }

    return hasRole
}

const hasPermission = (programId, roles, expectedRoles) => {
    let hasRole = false

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === ROLES.ADMIN) {
            hasRole = true
            break
        } else if (roles[i].programId === programId && expectedRoles.includes(roles[i].role)) {
            hasRole = true
            break
        }
    }

    return hasRole
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
        res.status(error.code || 500).json({ error: error.message })
    } else {
        res.status(400).json({ error })
    }
}

const validToken = async (req, res, next) => {
    if ((!req.headers['authorization'] || req.headers['authorization'] === '')) {
        return res.status(400).json({ error: 'Missing Authorization Header' })
    }

    try {
        let { user, account } = jwt.verify(req.headers['authorization'].replace('Bearer ', ''), process.env.TOKEN_SECRET_KEY)

        if (!user || !account) {
            return res.status(401).json({ error: 'Invalid Token' })
        }

        let roles = (await roleService.getRolesByUserId(user.id)).map(role => role.viewable)

        req.user = user
        req.account = account
        req.roles = roles
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ error: 'Invalid or Expired Token' })
    }
}

const permissionCheck = (...allowedRoles) => {
    return (req, res, next) => {
        let programId = req.query.programId || req.params.programId || req.body.programId
        let roles = req.roles || []
        let hasRole = false

        if (!programId) {
            return next({ code: 403, message: 'Unauthorized. Missing ProgramId in request.' })
        }

        for (let i=0; i < roles.length; i++) {
            if (roles[i].role === ROLES.ADMIN) {
                hasRole = true
                break
            } else if (roles[i].programId === programId && allowedRoles.includes(roles[i].role)) {
                hasRole = true
                break
            }
        }

        if (!hasRole) {
            return next({ code: 403, message: 'Unauthorized. User type is not allowed to make this request.' })
        }

        next()
    }
}

module.exports = {
    restrictToAdmin,
    restrictToOwnerOrHigher,
    restrictToInstructorOrHigher,
    permissionCheck,
    asyncHandler,
    errorHandler,
    validToken,
    hasRoles,
    hasPermission,
    ROLES
}