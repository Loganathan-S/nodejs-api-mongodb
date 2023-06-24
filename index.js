require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./router');

const app = express(); //create app 

app.use(express.json()) // receive json obj

app.use('/api',routes);

//conncet mongodb
mongoose.connect(process.env.DB_CONNCETION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

// to check database is conntected or not
const database = mongoose.connection

database.on('error',(err)=> console.log(err));
database.on('connected',()=> console.log("Database Connected"));


app.listen(3000, ()=> {
    console.log("server startrd on localost:3000");
})