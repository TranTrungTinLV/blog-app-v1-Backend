const generateToken = require('../../config/token/genertateToken');
const User = require('../../models/user/User');
const expressAsyncHandler = require("express-async-handler")
const validateMongoId = require("../../utils/validateMongodbID")
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
    //check if user Exist
    const userExist = await User.findOne({
        email: req?.body?.email
    })
    if (userExist) throw new Error("User exist")
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
});

//Login User
const loginUserCtrl = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const userFound = await User.findOne({ email });

    if (userFound && (await userFound.isPasswordMatched(password))) {
        res.json({
            _id: userFound?._id,
            firstName: userFound?.firstName,
            lastName: userFound?.lastName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin,
            token: generateToken(userFound?._id)
        })
    }
});

//--------------------
//Users
//--------------------

const fetchUserCtrl = expressAsyncHandler(async (req, res) => {
    console.log(req.headers);
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.json(error)
    }
})

//--------------------
//Delete User
//--------------------
const deleteUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    // if(!id) throw new Error('Please provide user')
    //check if user id is valid 
    validateMongoId(id)
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deleteUserCtrl);
    } catch (error) {
        res.json(error)
    }

})

//---------------------
//User Details
//---------------------
const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    //check if user id is valid 
    validateMongoId(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        res.json(error)
    }
})

//---------------------
//User Profile
//---------------------
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const myProfile = await User.findById(id);
        res.json(myProfile)
    } catch (error) {
        res.json(error)
    }
})
//---------------------
//Update Profile
//---------------------
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;
    validateMongoId(_id);
    const user = await User.findByIdAndUpdate(_id, {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        bio: req?.body?.bio,
    }, {
        new: true,
        runValidators: true
    })
    console.log(user)
    res.json(user)
});

//------------------
//Update Password
//------------------
const updatePassWordCtrl = expressAsyncHandler(async (req, res) => {
    //destructure the login user
    const { _id } = req.user;
    const { password } = req.body
    validateMongoId(_id);
    //Find the user by Id
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updateUser = await user.save();
        res.json(updateUser)
    }
    // return;
    res.json(user)
})
module.exports = { userRegisterCtrl, loginUserCtrl, fetchUserCtrl, deleteUserCtrl, fetchUserDetailsCtrl, userProfileCtrl, updateUserCtrl, updatePassWordCtrl };