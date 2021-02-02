require('dotenv').config({ path: __dirname + '/../.env' })
const argv = require('yargs').argv
const bcrypt = require('bcryptjs')

const Promise = require('promise')
const { database } = require('../db/database')

if (!argv.email) {
    console.log('missing email')
    process.exit(0)
}

if (!argv.firstName) {
    console.log('missing clientId')
    process.exit(0)
}

if (!argv.lastName) {
    console.log('missing clientId')
    process.exit(0)
}

if (!argv.password) {
    console.log('missing password')
    process.exit(0)
}

const salt = bcrypt.genSaltSync(10)
const hashedPassword = bcrypt.hashSync(argv.password, salt)

const sql = 'INSERT INTO Users (firstName, lastName, email, salt, hashed_password) VALUES(?, ?, ?, ?, ?);'
const values = [argv.firstName, argv.lastName, argv.email, salt, hashedPassword]

let userId
let programId
return database.query(sql, values).then(results => {
    return database.query('SELECT id FROM Users WHERE email=?', [argv.email])
}).then(results => {
    if (results.length === 0) {
        return Promise.reject('User not created')
    }

    userId = results[0].id
    return database.query('SELECT id FROM Programs WHERE name="System";', [])
}).then(results => {
    if (results.length === 0) {
        return Promise.reject('No Program named System exists.')
    }

    programId = results[0].id

    let sql = `INSERT INTO UserPrograms (programId, userId, role) VALUES (?,?,?);`
    let values = [programId, userId, 'admin']

    return database.query(sql, values)
}).then(results => {
    console.log('success!')
    process.exit(0)
}).catch(err => {
    console.log(err)
    process.exit(0)
})