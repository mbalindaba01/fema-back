const express = require('express')
const morgan = require('morgan')
const { createClient } = require('@supabase/supabase-js')
const bodyParser = require('body-parser')
const API = require('./routes/routes.js')

const app = express();
app.use(express.json())

app.use(morgan('combined'));


const supabaseUrl = 'https://jxtwcdtplicihiaramoa.supabase.co'
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHdjZHRwbGljaWhpYXJhbW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4ODY2NDUsImV4cCI6MjAwNTQ2MjY0NX0.sIxs_Z7VjfPf5sbei6nrC_j6Y0SfEtsP2fLVPLQVtr0'

const supabase = createClient(supabaseUrl, supabaseKey)


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

API(app, supabase);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running at port ' + PORT))

module.exports = app;
