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
        res.json(error)
    }
});

//Login User
const loginUserCtrl = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const userFound = await User.findOne({ email });

    //check if blocked
    if (userFound?.isBlocked) throw new Error("Access Denied You have been blocked")
    if (userFound && (await userFound.isPasswordMatched(password))) {
        res.json({
            _id: userFound?._id,
            firstName: userFound?.firstName,
            lastName: userFound?.lastName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin,
            token: generateToken(userFound?._id),
            isVerified: userFound?.isAccountVerified,
        })
    } else {
        res.status(401);
        throw new Error("Invalid Login")
    }
});

//--------------------
//Users
//--------------------

const fetchUserCtrl = expressAsyncHandler(async (req, res) => {
    // console.log(req.headers);
    try {
        const users = await User.find({}).populate("posts");
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
    //1. Find the login user
    //2. Check this particular if the login user exists in the array of view(viewedBy)

    //Get the login user
    const loginUserId = req?.user?._id?.toString();
    // console.log("login", typeof loginUserId)
    try {
        const myProfile = await User.findById(id).populate("post").populate("viewedBy");
        const alreadyViewed = myProfile?.viewedBy?.find(user => {
            // console.log(user);
            return user?._id?.toString() === loginUserId
        });

        if (alreadyViewed) {
            res.json(myProfile)
        } else {
            const profile = await User.findByIdAndUpdate(myProfile?._id, {
                $push: { viewedBy: loginUserId },
            })
            res.json(profile)
        }
    } catch (error) {
        res.json(error)
    }
})
//---------------------
//Update Profile
//---------------------
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;
    //block user
    blockUser(req?.user)
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
    // console.log(user)
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
    //1.Find the user you want to follow and update it's followers field
    //2. Update the login user following field
    const { followId } = req.body;
    const loginUserId = req.user.id;

    //find the target user and check if the login id exist
    const targetUser = await User.findById(followId);

    const alreadyFollowing = targetUser?.followers?.find(
        user => user?.toString() === loginUserId.toString()
    );

    if (alreadyFollowing) throw new Error("You have already followed this user");

    //1. Find the user you want to follow and update it's followers field
    await User.findByIdAndUpdate(
        followId,
        {
            $push: { followers: loginUserId },
            isFollowing: true,
        },
        { new: true }
    );

    //2. Update the login user following field
    await User.findByIdAndUpdate(
        loginUserId,
        {
            $push: { following: followId },
        },
        { new: true }
    );
    res.json("You have successfully followed this user");
})
//-----------------
//unFollow
//-----------------
const unFollowerCtrl = expressAsyncHandler(async (req, res) => {
    const { unFollowId } = req.body;
    const loginUserId = req.user.id;

    await User.findByIdAndUpdate(
        unFollowId,
        {
            $pull: { followers: loginUserId },
            isFollowing: false,
        },
        { new: true }
    );

    await User.findByIdAndUpdate(
        loginUserId,
        {
            $pull: { following: unFollowId },
        },
        { new: true }
    );

    res.json("You have successfully unfollowed this user");
})
//-----------------
//Block user
//-----------------
const blockUserCtrl = expressAsyncHandler(async (req, res) => {
    // console.log(req.params);
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
    // console.log(user)
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // console.log(loginUser)
    const verificationToken = await user?.createAccountVerificationToken();
    //save the user
    await user.save();

    // console.log(verificationToken);

    //build your message
    const resetURL = `If you were request to verify your account, verify now within 10 minutes, otherwise ignore thi message <a href="http://localhost:3000/verify-token/${verificationToken}">Click see</a>`
    const { userEmail } = req.body;
    // console.log(userEmail)
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
        to: user?.email,
        subject: "Verify your account",
        html: mail
    }

    transporter.sendMail(message)
        .then(() => {
            res.json(resetURL)
        }).catch(error => {
            return res.status(500).json({ error })
        })
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
        // console.log(token)
        await user.save();

        //build your message
        const resetURL = `If you were request to verify your password, verify now within 10 minutes, otherwise ignore thi message <a href="http://localhost:3000/reset-password/${token}">Click see</a>`
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
    //block user
    // blockUserCtrl(req?.user)
    // console.log(req.file)
    const localPath = `public/images/profile/${req.file.fileName}.jpeg`;
    //upload to cloudinary
    try {
        const imgUploaded = await cloudinaryUploadImg(localPath);
        const foundUser = await User.findByIdAndUpdate(_id, {
            profilePhoto: imgUploaded?.url
        }, { new: true })
        //remove the saved img
        fs.unlinkSync(localPath)
        // console.log(imgUploaded)
        res.json(imgUploaded)
    } catch (error) {
        console.error('Error in profilePhotoUploadCtrl:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})
module.exports = { userRegisterCtrl, loginUserCtrl, fetchUserCtrl, deleteUserCtrl, fetchUserDetailsCtrl, userProfileCtrl, updateUserCtrl, updatePassWordCtrl, followingUserCtrl, unFollowerCtrl, blockUserCtrl, unBlockUserCtrl, generationVerificationTokenCtrl, accountVerificationCtrl, ForgotPassWordToken, passwordResetCtrl, profilePhotoUploadCtrl };