const express = require('express')
const route  = require('./routes/routes')
const cors = require('cors')

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}



const app = express()

app.use(express.json())
app.use(allowCrossDomain)
app.use(cors())

app.use(route)
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running at port ' + PORT))
