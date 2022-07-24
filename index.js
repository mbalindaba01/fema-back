const express = require('express')
const route  = require('./routes/routes')
const cors = require('cors')



const app = express()

app.use(express.json())
app.use(cors({
    origin: 'http://127.0.0.1:5173'
}))

app.use(route)
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running at port ' + PORT))
