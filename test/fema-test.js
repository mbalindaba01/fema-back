const express = require('express');
const PgPromise = require('pg-promise')
const supertest = require('supertest');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();

const API = require('../routes/routes');

const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const config = {
	connectionString: 'postgresql://postgres:sane:sane123@localhost:5432/fema_app',
	max: 30
};

if(process.env.NODE_ENV == 'production'){
    config.ssl = {
		rejectUnauthorized : false
	}
    config.connectionString = process.env.DATABASE_URL
}

const pgp = PgPromise({});
const db = pgp(config);

API(app, db);

describe('Female app', function(){
    before(async function () {
		this.timeout(5000);
		// await db.none(`delete from users`);
	// 	const commandText = fs.readFileSync('./database/data.sql', 'utf-8');
	// 	await db.none(commandText)
	});

    // it('should have a test method', async () => {

	// 	const response = await supertest(app)
	// 		.get('/fema')
	// 		.expect(200);

	// 	assert.deepStrictEqual('it works', response.body);
	// });

    // it('should be able to register a user', async () => {
    //     const response = await supertest(app)
    //     .post('/fema/register')
    //     .send({full_name: 'Inga Duma',
    //     email: 'inga@gmail.com',
    //     password: 'inga'
    // })

    // // console.log(response.body);
    // assert.equal('user registered successfully', response.body);
    // })

    // it('should be able to login a user', async () => {
    //     await supertest(app)
    //     .post('/fema/login')
    //     .send({
    //         email: 'inga@gmail.com',
    //         password: 'inga'
    //     })
    //     .expect(200)
    // });

    // it('should be able to register a facility', async () => {
    //     const response = await supertest(app)
    //     .post('/fema/registerFacility')
    //     .send({
    //         facName: 'Clicks12',
    //         facLocation: 'Bara Soweto',
    //         facReg: 'GP 122 44',
    //         capacity: 3,
    //         contactno: '0218995563',
    //         email: 'clicks@gmail.com',
    //         password: 'clicks12',
    //         services: 'pregnancy termination'
    // })

    // // console.log(response.body);
    // assert.equal('Succesful registration', response.body);

    // });

    // it('should be able to login a facility', async () => {
    //     await supertest(app)
    //     .post('/fema/registerFacility')
    //     .send({
    //         email: 'clicks@gmail.com',
    //         password: 'clicks12',
    // }).expect(200)

    // });

    // it('should be able to find all the available services', async () => {
	// 	const response = await supertest(app)
	// 		.get('/fema/services')
	// 		.expect(200);

	// 	const services = response.body.data;
    //     // console.log(services);
	// 	assert.deepStrictEqual([
    //         {
    //           count: '3'
    //         }
    //       ], services);

	// });

    it('should be able to find services that are offered by facility', async () => {
		const response = await supertest(app)
			.get('/fema/services/:facility')
            .send({
                facility: "Bophelong Women's health"
            })
			.expect(200);

		const services = response.body.data;
        console.log(services);
		assert.deepStrictEqual([], services);
	});

    // it('should be able to find all the available facilities', async () => {
	// 	const response = await supertest(app)
	// 		.get('/fema/facilities')
	// 		.expect(200);

	// 	const facilities = response.body.data;
    //     console.log(facilities);
	// 	assert.deepStrictEqual([], facilities);

	// }); 

    // it('should be able to make a booking', async () => {
    //     const response = await supertest(app)
    //     .post('/fema/makebooking')
    //     .send({
    //         facilityName: 'Clicks12',
    //         email: 'clicks@gmail.com',
    //         date: '10-12-2022',
    //         time: '10:00',
    //         serviceId: 126
    // })

    // console.log(response.body);
    // assert.deepStrictEqual('Booking Successful', response.body);
    // });

    // it('should be able to get all bookings made by user', async () => {
    //     const response = await supertest(app)
    //     .get('/fema/userbookings')
    //     .send({
    //         email: 'siweh@gmail.com',
    // })

    // const userBookings = response.body.bookings;
    // assert.deepStrictEqual([{ count: '0' }], userBookings);

    // });

    // it('should be able to get all bookings made by a facility', async () => {
    //     const response = await supertest(app)
    //     .get('/fema/facilitybookings')
    //     .send({
    //         email: 'clicks@gmail.com',
    // })

    // // console.log(response.body.bookings);
    // const facilityBookings = response.body.data;
    // assert.strictEqual(0, facilityBookings);

    // });

    // it('should be able to get all the facilities that offer a service route', async () => {
    //     const response = await supertest(app)
    //     .get('/fema/facilities/:id')
    //     .send({
    //         facility_id: 1
    //     })
    //     .send(200)
    //     let servicesFacilities = response.body
    //     assert.equal()
    // })

});