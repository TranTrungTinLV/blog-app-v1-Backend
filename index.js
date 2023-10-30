//API create
const bodyParser = require("body-parser");
const dbConnect = require('./config/db/dbConnect');
const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const userRoutes = require("./route/users/user");
const { errorHandler,notFound } = require("./middlewares/error/errorMandler");
const postRoute = require("./route/posts/post");

const port = process.env.PORT || 4000
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//MiddleWare
app.use(bodyParser.json())
dbConnect();
//Register
app.use('/api/users', userRoutes);
//Post Route
app.use("/api/posts",postRoute)
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

//err handler
app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Hello API`)
})

//authen