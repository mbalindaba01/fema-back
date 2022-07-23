const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'Hello'
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running at port ' + PORT))
