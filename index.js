import express from 'express';
import { createClient } from '@supabase/supabase-js'
import morgan from 'morgan'
import bodyParser from "body-parser";
const API = require('./routes/routes')

const app = express();
app.use(express.json())

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const supabase = supabaseClient.createClient({
  apiKey: process.env.ANON_KEY,
  project: process.env.SUPABASE_URL
});

API(app, supabase);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running at port ' + PORT))

module.exports = app;
