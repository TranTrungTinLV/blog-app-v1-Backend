const mongoose = require('mongoose')
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true, useUnifiedTopology: true
        });
        
        console.log("Db is Connected Successfully")
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = dbConnect;