require('dotenv').config({ path: __dirname + '/../.env' })
const PORT = process.env.PORT || 8080;
const http = require('http')
const path = require('path')
const cors = require('cors')
const express = require('express')
const app = express()
const { asyncHandler, errorHandler } = require('./helpers/helpers')
const { mailer } = require('./helpers/mailer')
const { database } = require('./db/database');
const { V1Router } = require('./controllers')

app.use(cors({
    allowedHeaders: [
        'Refresh-Token', 'Content-Type', 'Authorization'
    ]
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../app/build')));

app.get('/api', asyncHandler(async (req, res) => {
    let results = await database.query('SELECT MAX(migration) as migration, version FROM SystemInfo', [])
    if (results && results.length > 0) {
        res.status(200).json({ apiVersion: results[0].version })
    } else {
        res.status(500).json({ error: 'Unable to find system version' })
    }
}))
app.get('/api/health', (req, res) => {
    res.status(200).send('Server Healthy')
})

app.use('/api/v1', new V1Router().router)

app.use(errorHandler)
const server = http.createServer(app);
server.listen(PORT, async () => console.log('Server listening on:' + PORT));

process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection', err)
    process.exit(1)
})

process.on('beforeExit', (err) => {
    mailer.close()
    server.close()
    console.log('beforeExit', err)
    process.exit(1)
})