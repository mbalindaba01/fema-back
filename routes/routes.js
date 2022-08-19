module.exports = function (app, db){
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    

    app.get('/fema', async (req, res) => {
        res.json('it works')
    });

//register users route
app.post('/fema/register', async (req, res) => {
    try {
        let full_name = req.body.full_name
        let email = req.body.email
        let password = req.body.password

        bcrypt.hash(password, 10).then(async(hashedPass) => {
            await db.none('insert into users(full_name, email, password) values ($1, $2, $3)', [full_name, email, hashedPass])
        });
        // console.log(full_name);
        res.json('user registered successfully');
    }catch (error) {
		console.log(error);
        	res.json({
			status: "error",
			error: error.message,
		});
	}
});

//login users route
app.post("/fema/login", async (req, res) => {
	const { password, email} = req.body;
    try {
        const user = await db.oneOrNone(`select * from users where email=$1`, [
			email,
		]);
		if (!user) return res.status(400).send("User does not exist");

		const dbPassword = user.password;
	const validPass = await bcrypt.compare(password, dbPassword);
    
	if (!validPass) {
        return res.status(400).send("Invalid email or password");
    }
	//create and assign token
	const tokenUser = { email: email };
	const token = jwt.sign(tokenUser, process.env.TOKEN_SECRET);

    // console.log({token});
    res.header("access_token", token).send(token);
    }
	catch(error){
		res.json(error)
	}
}); 

//get all services
app.get('/fema/services', async (req, res) => {
    try {
        let services = await db.any('select * from service_config')
        res.json(services)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})


   
//get a service route

// app.get("/fema/services/:servicename", async (req, res) => {
// 	const { servicename } = req.params.servicename;
// 	console.log(req.params);
// 	const results = await db.oneOrNone(
// 		`select * from services where servicename = $1`,
// 		[servicename.toLowerCase()]
// 	);
// 	console.log(results);

// 	res.json({
// 		service: results,
// 	});
// });

    //register facilities route
    app.post('/fema/registerFacility', async (req, res) => {
        try {
            const { facName, facReg, capacity, city, province, contactno, email, password, services } = req.body           
            bcrypt.hash(password, 10)
            .then(async(hashedPass) => {
                await db.none('insert into facilities(facility_name, city, province, facility_reg, facility_capacity, facility_contacno, facility_email, password) values ($1, $2, $3, $4, $5, $6, $7, $8)', [facName, city, province, facReg, capacity, contactno, email, hashedPass])
                let facilityId = await db.one('select facility_id from facilities where facility_email = $1', [email])
                services.forEach(service => db.none('insert into services(facility_ref, serv_config_ref) values ($1, $2)', [facilityId.facility_id, service]))
                res.json('Succesful registration')
            })
        } 
        catch (error) {
            console.log(error)
            res.json(error)
        }
    });


    //login facility route
    app.post("/fema/loginFacility", async (req, res) => {
        const { facilityPass, facilityEmail} = req.body;
        const user = await db.oneOrNone(
            `select * from facilities where facility_email=$1`,
            [facilityEmail]
        );
        if (!user) return res.status(400).send("Facility does not exist");

        const dbPassword = user.password;

        const validPass = await bcrypt.compare(facilityPass, dbPassword);
        if (!validPass) return res.status(400).send("Invalid email or password");
    }); 

    app.get('/fema/services/:facility', async (req, res) => {
        try {
            let facility = req.params.facility
            let facilityId = await db.any('select facility_id from facilities where facility_name = $1',[facility])
            let services = [];
            console.log(facilityId);
            let service_refs = await db.any('select serv_config_ref from services where facility_ref = $1', [facilityId[0].facility_id]);
            for(let i = 0; i < service_refs.length; i++){
                let service = await db.any('select * from service_config where serv_config_id = $1', [service_refs[i].serv_config_ref])
                services.push(service[0])
            }         
            // console.log(services);  
            res.json({
                data: services
            })
        } 
        catch (error) {
            console.log(error)
            res.json(error)
        }
    });
    
    //make booking route
    app.post('/fema/makebooking', async (req, res) => {
            try {
                const { email, facilityName, date, time, serviceId } = req.body;
               
                let userRef = await db.oneOrNone('select user_id from users where email = $1', [email])
                // console.log(userRef);
                if (userRef) {
                    let facilityRef = await db.any('select facility_id from facilities where facility_name = $1', [facilityName]);
                    // console.log(facilityRef);                                                    
                    await db.none("insert into bookings(user_ref, facility_ref, service_id, booking_date, booking_time, booking_status) values ($1, $2, $3, $4, $5, $6)", [userRef.user_id, facilityRef[0].facility_id, serviceId, date, time, 'pending'])
                    res.json({
                        message: 'Booking Successful'
                    })
                }
            } catch (error) {
                console.log(error)
                res.json(error)
            }
        });

    //return all bookings made by user route
    app.get('/fema/userbookings/:user', async (req, res) => {
        try {
            let userEmail = req.params.user
            // console.log(userEmail)
            let userID = await db.any('select user_id from users where email = $1', [userEmail])
            let bookings = await db.any('select booking_id, booking_date, booking_time, booking_status, facility_name, city, province, facility_reg, facility_contacno, facility_email, name from bookings inner join facilities on bookings.facility_ref = facilities.facility_id inner join service_config on service_config.serv_config_id = bookings.service_id where user_ref = $1', [userID[0].user_id])
            res.json({
                bookings,
            })
        }
        catch (error) {
            console.log(error)
            res.json(error)
        }
    });

    //get all the bookings made by users to a facility
    app.get('/fema/facilitybookings/:facility', async (req, res) => {
        try {
            let facilityEmail = req.params.facility
            console.log(facilityEmail);
            let facilityRef = await db.any('select facility_id from facilities where facility_email = $1', [facilityEmail])
            // console.log(facilityRef)
            let bookings = await db.any('select booking_id, booking_date, booking_time, booking_status, full_name, email, name from bookings inner join users on bookings.user_ref = users.user_id inner join service_config on service_config.serv_config_id = bookings.service_id where facility_ref = $1', [facilityRef[0].facility_id])
            // console.log(bookings);
            res.json({data: bookings})
        } 
        
        catch (error) {
            res.json(error)
            console.log(error);
        }
    });

    //get all the facilities that offer a service route
    app.get('/fema/serviceproviders/:id', async (req, res) => {
        try {
            let serviceId = req.params.id
            let facilities = await db.any('select facilities.* from service_config inner join services on serv_config_id = serv_config_ref inner join facilities on facility_id = facility_ref where serv_config_id = $1', [serviceId])
            res.json(facilities)
        } 
        catch (error) {
            console.log(error)
            res.json(error)
        }
    })

    //get all the facilities from a given province
    app.get('/fema/provinceprov/:id', async (req, res) => {
        try {
            let province = req.params.id
            let facilities = await db.any('select * from facilities where province = $1', [province])
            res.json(facilities)
        } 
        catch (error) {
            console.log(error)
            res.json(error)
        }
    })

    //get all the facilities that match a service and a province
    app.get('/fema/filterfacilities/:id/:province', async (req, res) => {
        try {
            let serviceId = req.params.id
            let province = req.params.province
            let facilities = await db.any('select facilities.* from service_config inner join services on serv_config_id = serv_config_ref inner join facilities on facility_id = facility_ref where serv_config_id = $1 and province = $2', [serviceId, province])
            res.json(facilities)
        } 
        catch (error) {
            console.log(error)
            res.json(error)
        }
    })

    // //update booking status route
    // app.post('/fema/bookings/:id', async (req, res) => {
    //     try {
    //         let id = req.params.id
    //         await db.none('update bookings set booking_status = $1 where booking_id = $2',['confirmed', id])
    //         res.json('booking accepted')
    //     } 
    //     catch (error) {
    //         res.json('Something went wrong. Please try again')
    //     }
    // })

    // //delete bookings route
    // app.delete('/fema/userbookings/:id', async (req, res) => {
    // try {
    //     let bookingId = 3
    //     await db.none('delete from bookings where booking_id = $1', [bookingId])
    //     res.json('Booking successfully deleted.')
    // } 
    
    // catch (error) {
    //     res.json('Something went wrong. Please try again.')
    // }
    // })

    //edit bookings route
    app.put('/fema/userbookings/:id', async (req, res) => {
        try {
            let bookingId = req.params.id
            const { date, time, serviceId } = req.body
            await db.none('update bookings set booking_date = $1, booking_time = $2, service_id = $3 where booking_id = $4', [date, time, serviceId, bookingId])
            await db.none('update bookings set booking_status = $1 where booking_id = $2', ['pending', bookingId])
            res.json('Booking updated successfully')
        } 
        catch (error) {
            console.log(error)
            res.json('Something went wrong. Please try again')
        }
    })

    //get all the facilities that offer a service route
    app.get('/fema/facilities', async (req, res) => {
        // try {       
        // let serviceId = req.params.id
        // let facilities = await db.any('select facilities.* from service_config inner join services on serv_config_id = serv_config_ref inner join facilities on facility_id = facility_ref where serv_config_id = $1', [serviceId])
        // // console.log(facilities);
        // res.json(facilities)
        // } 
        
        // catch (error) {
        //     console.log(error)
        //     res.json(error)
        // }

        try {
            let facilities = await db.any('select * from facilities');
            // console.log(facilities);
            res.json(facilities)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    })

    //update booking status route
    app.post('/fema/bookings/:id', async (req, res) => {
        try {
            let id = req.params.id
            let status = req.body.status
            await db.none('update bookings set booking_status = $1 where booking_id = $2',[status, id])
            res.json('booking accepted')
        } 
        catch (error) {
            console.log(error)
            res.json('Something went wrong. Please try again')
        }
    })

    //delete bookings route
    app.delete('/fema/userbookings/:id', async (req, res) => {
        let bookingId = req.params.id
        try {
            await db.none('delete from bookings where booking_id = $1', [bookingId])
            res.json('Booking successfully deleted')
        } 
        
        catch (error) {
            res.json('Something went wrong. Please try again.')
        }
    });

    app.get('/fema/ratings/:id', async (req, res) => {
        let facilityId = req.params.id
        try {
            let ratingInfo = await db.any('select rate_count, rating from facilities where facility_id = $1', [facilityId])
            res.json(ratingInfo)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    })

    app.put('/fema/ratings/:id', async (req, res) => {
        let facilityId = req.params.id
        const { rateCount, rating } = req.body
        try {
            db.none('update facilities set rate_count = $1, rating = $2 where facility_id = $3', [rateCount, rating, facilityId])
            res.json('rating submitted successfully')
        } catch (error) {
            res.json(error)
            console.log(error)
        }
    })

}
