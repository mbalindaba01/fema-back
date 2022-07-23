const express = require('express')
const route  = require('./routes/routes')

const app = express()

app.use(express.json())

app.use(route)
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running at port ' + PORT))
