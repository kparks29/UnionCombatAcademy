require('dotenv').config({ path: __dirname + '/../.env' })
const http = require('http')
const path = require('path')
const cors = require('cors')
const express = require('express')
const app = express()
const { errorHandler } = require('./helpers/helpers')
const { mailer } = require('./helpers/mailer')
const PORT = process.env.PORT || 8080;

app.use(cors({
    allowedHeaders: [
        'Refresh-Token', 'Content-Type', 'Authorization'
    ]
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../app')));
app.use(errorHandler)


app.get('/api/health', (req, res) => {
    res.status(200).send('Server Healthy')
})

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