const express = require('express')
const pgp = require('pg-promise')()
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({
    origin: ['*'],
    credentials: true
}));

dotenv.config()

//connection to database
const config = {
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Minenhle!28@localhost:5432/fema',
    ssl: {
        rejectUnauthorized: false
    }
}
const db = pgp(config)

app.get('/', (req, res) => {
    res.json('Welcome to fema api')
})

//register route for individual users
app.post('/register', async(req, res) => {
    try {
        const { name, email, password } = req.body
        bcrypt.hash(password, 10).then(async(hashedPass) => {
            await db.none('insert into users(full_name, email, password) values ($1, $2, $3)', [name, email, hashedPass])
            res.json('Successful register')
        })        
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//login route for individual users
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
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

//route to register facility
app.post('/registerFacility', async (req, res) => {
    try {
        const { name, location, reg, capacity, contact, email, password, services} = req.body
        
        bcrypt.hash(password, 10).then(async(hashedPass) => {
            await db.none('insert into facilities(name, location, reg, capacity, contact, email, password) values ($1, $2, $3, $4, $5, $6, $7)', [name, location, reg, capacity, contact, email, hashedPass])
            let facilityId = await db.one('select facility_id from facilities where email = $1', [email])
            services.forEach(service => db.none('insert into services(facility_ref, config_ref) values ($1, $2)', [facilityId.facility_id, service]))
            res.json('Successful registration') 
        })  
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//route for facility reps to login
app.post('/loginFacility', async (req, res) => {
    try {
        // const { email, password } = req.body

        let facExists = await db.any('select * from facilities where email = $1', [email])
        if(facExists){
            let validPassword = await bcrypt.compare(password, facExists[0].password)
            if(validPassword){
                res.json('successful login')
            }else{
                res.json('Invalid password or email')
            }
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//get services that are offered on the app
app.get('/services', async (req, res) => {
    try {
        let services = await db.many('select * from service_config')
        res.json({
            services
        })
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//route to make booking
app.post('/makebooking', async (req, res) => {
    try {
        const { email, facilityName, date, time, serviceId } = req.body;
        let userRef = await db.oneOrNone('select user_id from users where email = $1', [useremail])
        console.log(userRef);
        if (userRef) {
            let facilityRef = await db.any('select facility_id from facilities where name = $1', [facilityName]);
            console.log(facilityRef);
            await db.none("insert into bookings(user_ref, facility_ref, service_id, booking_date, booking_time, booking_status) values ($1, $2, $3, $4, $5, $6)", [userRef.user_id, facilityRef[0].facility_id, serviceId, date, time, 'pending'])
        }
        

        res.json({
            message: 'Booking Successful'
        })
    }

    catch(error){
        console.log(error)
        res.json(error)
    }
})

//get all the bookings made to a facility
app.get('/facilitybookings', async (req, res) => {
    try {
        let facilityEmail = req.body.email
        let facilityRef = await db.any('select facility_id from facilities where facility_email = $1', [facilityEmail])
        console.log(facilityRef)
        let bookings = await db.any('select * from bookings where facility_ref = $1', [facilityRef[0].facility_id])
        res.json(bookings)
    } 
    
    catch (error) {
        res.json(error)
    }
})

//get all the facilities that offer a service route
app.get('/facilities/:id', async (req, res) => {
    try {       
       let serviceId = req.params.id
       let facilities = await db.any('select facilities.* from service_config inner join services on serv_config_id = serv_config_ref inner join facilities on facility_id = facility_ref where serv_config_id = $1', [serviceId])
       res.json({
        facilities
       })
    } 
    
    catch (error) {
        console.log(error)
        res.json(error)
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running at port ' + PORT))
