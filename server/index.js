const path = require('path')
const express = require('express')
const app = express()

app.get('/api/health', (req, res) => {
    res.status(200).send('Server Healthy')
})

app.use(express.static(path.join(__dirname, '../app')));

app.listen(8000, () => {
    console.log(`Server listening port 8000`)
})