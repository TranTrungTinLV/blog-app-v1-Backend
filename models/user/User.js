const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
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

// === custom middleware to handle hashing password
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    };
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//match password using mongoose methods
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    const isMatched = await bcrypt.compare(enteredPassword, this.password);
    // console.log('Password matched:', isMatched);
    return isMatched;
}

//virtual method to populate created post
userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
});

//Compile schema into model
const User = mongoose.model("User", userSchema);

module.exports = User;

