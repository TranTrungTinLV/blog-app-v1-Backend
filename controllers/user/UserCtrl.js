const generateToken = require('../../config/token/genertateToken');
const User = require('../../models/user/User');
const expressAsyncHandler = require("express-async-handler")
const validateMongoId = require("../../utils/validateMongodbID")
const nodemailer = require("nodemailer")
const Mailgen = require("mailgen");
const crypto = require("crypto");
const fs = require('fs')
const cloudinaryUploadImg = require('../../utils/cloudinary');
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
    }else{
        res.status(401);
        throw new Error("Invalid Login")
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
        const myProfile = await User.findById(id).populate("post");
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
//---------------------------
//following
//---------------------------
const followingUserCtrl = expressAsyncHandler(async (req, res) => {
    //1. Find user want follow and update it's follower field
    //2. Update the login user following field
    const { followId } = req.body;
    const loginUserId = req.user.id;
    // console.log({
    //     followId,
    //     loginUserId
    // })
    //1. Find user want follow and update it's follower field
    await User.findByIdAndUpdate(followId, {
        $push: {
            followers: loginUserId,
        },
        isFollowing: true,
    }, { new: true })
    //2. Update the login user following field
    await User.findByIdAndUpdate(loginUserId, {
        $push: {
            following: followId
        }
    }, { new: true })
    res.json("You have successfully follow this user")
})
//-----------------
//unFollow
//-----------------
const unFollowerCtrl = expressAsyncHandler(async (req, res) => {
    const { unfollowId } = req.body;
    const loginUserId = req.user.id;
    await User.findByIdAndUpdate(unfollowId, {
        $pull: {
            followers: unfollowId
        },
        isFollowing: false,
    }, { new: true });
    await User.findByIdAndUpdate(loginUserId, {
        $pull: { following: unfollowId },
    }, { new: true });
    res.json("You have unfollowing")
})
//-----------------
//Block user
//-----------------
const blockUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    const user = await User.findByIdAndUpdate(id, {
        isBlocked: true
    }, {
        new: true
    });
    res.json(user)
})
//-----------------
//UnBlock user
//-----------------
const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    const user = await User.findByIdAndUpdate(id, {
        isBlocked: false
    }, {
        new: true
    });
    res.json(user)
})
//---------------
// Account Verification - Send Mail
//---------------
const generationVerificationTokenCtrl = expressAsyncHandler(async (req, res, next) => {
    const loginUser = req.user.id;
    const user = await User.findById(loginUser);
    console.log(user)
    // console.log(loginUser)
    const verificationToken = await user.createAccountVerificationToken();
    console.log(verificationToken);
    //save the user
    await user.save();
    //build your message
    const resetURL = `If you were request to verify your account, verify now within 10 minutes, otherwise ignore thi message <a href="http://localhost:3000/${verificationToken}">Click see</a>`
    const { userEmail } = req.body;
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }
    let transporter = nodemailer.createTransport(config)
    let MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: "Mailgen",
            link: 'http://mailgen.js/'
        }
    });

    let response = {
        body: {
            name: "Daily Tuition",
            intro: resetURL,
            outro: "Thank you see mail",

        }

    }
    let mail = MailGenerator.generate(response)

    let message = {
        from: "trantintin1989@gmail.com",
        to: userEmail,
        subject: "Verify your account",
        html: mail
    }

    transporter.sendMail(message)
        .then(() => {

        }).catch(error => {
            return res.status(500).json({ error })
        })
    res.json(resetURL)
})
//---------------
//Account Verification
//---------------
const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
    const { token } = req.body;
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    //Find this user by token 
    const userFound = await User.findOne({
        accountVerificationToken: hashToken,
        accountVerificationTokenExpires: { $gt: new Date() }
    });
    if (!userFound) throw new Error("Token expired, try again later!");
    //update the proprt to true
    userFound.isAccountVerified = true,
        userFound.accountVerificationToken = undefined;
    userFound.accountVerificationTokenExpires = undefined;
    await userFound.save();
    res.json(userFound)
})
//-------------------
//Forgot token generator
//-------------------
const ForgotPassWordToken = expressAsyncHandler(async (req, res) => {
    //find the user by email
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found")
    res.send("forget password")
    try {
        const token = await user.createPasswordResetToken();
        console.log(token)
        await user.save();

        //build your message
        const resetURL = `If you were request to verify your password, verify now within 10 minutes, otherwise ignore thi message <a href="http://localhost:3000/${token}">Click see</a>`
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        let transporter = nodemailer.createTransport(config)
        let MailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: "Mailgen",
                link: 'http://mailgen.js/'
            }
        });

        let response = {
            body: {
                name: "Daily Tuition",
                intro: resetURL,
                outro: "Thank you see mail",

            }

        }
        let mail = MailGenerator.generate(response)

        let message = {
            from: "trantintin1989@gmail.com",
            to: email,
            subject: "Reset Password",
            html: mail
        }

        transporter.sendMail(message)
            .then(() => {
                msg: `A verification meg is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`

            }).catch(error => {
                return res.status(500).json({ error })
            })
        res.json(mail)
    } catch (error) {

    }
})

//--------------------
//Password reset
//--------------------
const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

    //find this user by token 
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });
    if (!user) throw new Error("Token Expired, try again later");

    //Update/change the password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user)
})

//---------------------
//Profile upload photo
//---------------------
const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
    const { _id } = req.user;

    // console.log(req.file)
    const localPath = `public/images/profile/${req.file.fileName}.jpeg`;
    //upload to cloudinary
    const imgUploaded = await cloudinaryUploadImg(localPath);
    const foundUser = await User.findByIdAndUpdate(_id, {
        profilePhoto: imgUploaded?.url
    }, { new: true })
    //remove the saved img
    fs.unlinkSync(localPath)
    console.log(imgUploaded)
    res.json(imgUploaded)
})
module.exports = { userRegisterCtrl, loginUserCtrl, fetchUserCtrl, deleteUserCtrl, fetchUserDetailsCtrl, userProfileCtrl, updateUserCtrl, updatePassWordCtrl, followingUserCtrl, unFollowerCtrl, blockUserCtrl, unBlockUserCtrl, generationVerificationTokenCtrl, accountVerificationCtrl, ForgotPassWordToken, passwordResetCtrl, profilePhotoUploadCtrl };