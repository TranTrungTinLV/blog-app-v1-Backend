const bodyParser = require("body-parser");
const dbConnect = require('./config/db/dbConnect');
const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const userRegisterCtrl = require("./controllers/user/UserCtrl");
const port = 4000
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
dbConnect();
//Register
app.post("/api/users/register", userRegisterCtrl)
//Login
app.post("/api/users/login", (req, res) => {
    //business logic
    res.json({
        user: "User Login"
    })
})
//fetch all user
app.get("/api/users", (req, res) => {
    //business logic
    res.json({
        user: "Fetch all user"
    })
})
app.listen(port, () => {
    console.log(`Hello API`)
})