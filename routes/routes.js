const router = require('express').Router()
const pgp = require('pg-promise')()
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
dotenv.config()

//connection to database
const config = {
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Minenhle!28@localhost:5432/fema',
}
const db = pgp(config)

//register route for individual users
router.post('/register', async(req, res) => {
    try {
        // const { name, email, password } = req.body
        let name = 'Mbali',
            email = 'mbalindaba01@gmail.com',
            password = 'Mbali123'
        bcrypt.hash(password, 10).then(async(hashedPass) => {
            await db.none('insert into users(full_name, email, password) values ($1, $2, $3)', [name, email, hashedPass])
        })        
        res.json('Successful register')
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//login route for individual users
router.post('/login', async (req, res) => {
    try {
        // const { email, password } = req.body
    const email = 'mbalindaba01@gmail.com'
    const password = 'Mbali123'

    let userExists = await db.any('select * from users where email = $1', [email])
    if(userExists){
        let validPassword = await bcrypt.compare(password, userExists[0].password)
        if(validPassword){
            res.json('successful login')
        }
    }
    } catch (error) {
        console.log(error)
        res.json(error)
    }

})

module.exports = router