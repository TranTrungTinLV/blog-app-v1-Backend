const User = require('../../models/user/User');


const userRegisterCtrl = async (req, res) => {
    //Register User
    try {
        const user = await User.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            password: req?.body?.password,
        });
        res.json(user)
    }
    catch (error) {
        console.log("có lỗi")
        console.log(error)
        res.json(error)
    }
}

module.exports = userRegisterCtrl;