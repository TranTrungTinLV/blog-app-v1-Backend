const express = require('express');
const dbConnect = require('./config/db/dbConnect');
const dotenv = require('dotenv')
dotenv.config()
const app = express();
dbConnect();



// console.log(process.env)

const port = 3000;
app.listen(port, () => {
    // console.log(`Hello ${port}`)
})

