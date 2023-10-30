const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const crypto = require("crypto")
//create schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            required: [true, "First name is required"],
            type: String,
        },
        lastName: {
            required: [true, "Last name is required"],
            type: String,
        },
        profilePhoto: {
            type: String,
            default: 'https://cdn.pixabay.com/photo/2014/04/03/11/47/avatar-312160_1280.pnghttps://cdn.pixabay.com/photo/2014/04/03/11/47/avatar-312160_1280.png',
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        bio: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Hei buddy Password is required"],
        },
        postCount: {
            type: Number,
            default: 0,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["Admin", "Guest", "Blogger"],
        },
        isFollowing: {
            type: Boolean,
            default: false,
        },
        isUnFollowing: {
            type: Boolean,
            default: false,
        },
        isAccountVerified: { type: Boolean, default: false },
        accountVerificationToken: String,
        accountVerificationTokenExpires: Date,

        viewedBy: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },

        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        following: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        passwordChangeAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,

        active: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

//virtual method to populate create post
userSchema.virtual('posts', {
    ref: 'Post',
    foreignField: 'user',
    localField: '_id'
})
// === custom middleware to handle hashing password
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    };
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//Verify account
userSchema.methods.createAccountVerificationToken = async function () {
    //create a token 
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000 //10 minutes
    return verificationToken
}

//Password reset/forget
userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log({ resetToken })
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; //10 minutes
    return resetToken;
}

//match password using mongoose methods
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    const isMatched = await bcrypt.compare(enteredPassword, this.password);
    // console.log('Password matched:', isMatched);
    return isMatched;
}

//virtual method to populate created post
userSchema.virtual("post", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
});

//Compile schema into model
const User = mongoose.model("User", userSchema);

module.exports = User;

