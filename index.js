const express = require('express')
const PgPromise = require("pg-promise")
require('dotenv').config();
const cors = require('cors')
const API = require('./routes/routes')

const app = express();
app.use(express.json())

app.use(cors())

app.options("*", cors());




const config = {
	connectionString: 'postgresql://postgres:Minenhle!28@localhost:5432/fema_app',
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running at port ' + PORT))

module.exports = app;
