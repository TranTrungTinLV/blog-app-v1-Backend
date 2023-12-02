const expressAsyncHandler = require("express-async-handler");
const Filter = require('bad-words')
const Post = require("../../models/post/Post");
const fs = require('fs')
const validateMongoId = require("../../utils/validateMongodbID");
const User = require("../../models/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/blockUser");
//------------------------
//CREATE POST
//------------------------

const createPostCtrl = expressAsyncHandler(async (req, res) => {
    // console.log(req.file)
    const { _id } = req.user;
    //block user
    blockUser(req.user);
    // validateMongoId(req.body.user);
    //check for bad word

    const filter = new Filter();
    const isProfane = filter.isProfane(req.body.title, req.body.description);
    //Block user if say isProfane
    if (isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true
        });
        throw new Error(`Creating failed because it contains profane words and you have been blocked `)
    }
    // console.log(isProfane);

    //Prevent user account is a starter account
    if(req?.user?.accountType === "Starter Account"&& req?.user?.postCount >= 2) throw new Error("Starter account can only create two posts");



    // console.log(req.file)
    const localPath = `public/images/posts/${req.file.fileName}.jpeg`;
    //upload to cloudinary
    const imgUploaded = await cloudinaryUploadImg(localPath);
    // res.json(imgUploaded)
    try {
        const post = await Post.create(
            {
                ...req.body,
                image: imgUploaded?.url,
                user: _id
            }
        );
        //update the user post count
        await User.findByIdAndUpdate(_id,{
            $inc: {postCount: 1}
        },{
            new:true
        });
        // console.log(req.user)
        // console.log(post);
        res.json(post);
        //Remove img cloudinary
        fs.unlinkSync(localPath)
    } catch (error) {
        res.json(error)
    }
})
//---------------------
// Fetch all posts
//---------------------
const fetchPostsCtrl = expressAsyncHandler(async (req, res) => {
    const hasCategory = req.query.category;
    // console.log("Category Received:", hasCategory); // This should show you the actual category received
    try {
        if (hasCategory) {
            const posts = await Post.find({ category: hasCategory }).populate('user').populate('comments').sort('-createdAt')
            res.json(posts);

        } else {
            const posts = await Post.find({}).populate('user').populate('comments').sort('-createdAt')
            res.json(posts)
            // console.log("không thấy")
        }
    } catch (error) { }
})
//-------------------
//fetch single post
//-------------------
const fetchPostCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const post = await Post.findById(id).populate("user").populate("disLikes").populate("likes").populate('comments');
        //update number of views
        await Post.findByIdAndUpdate(id, {
            $inc: {
                numViews: 1
            }
        }, { new: true })
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})
//-----------------
//Update Post
//----------------- 
const updatePostCtrl = expressAsyncHandler(async (req, res) => {
    // console.log(req.user)
    const { id } = req.params;
    validateMongoId(id);
    try {
        const post = await Post.findByIdAndUpdate(id, {
            ...req.body,
            user: req.user?._id,
        }, {
            new: true
        });
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})
//-----------------------------
//Delete Post
//-----------------------------
const deletePostCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const post = await Post.findOneAndDelete({_id : id});
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})
//------------------------------
//Like
//------------------------------
const toggleAndLikeToPost = expressAsyncHandler(async (req, res) => {
    //1.Find the post to be liked
    const { postId } = req.body;
    const post = await Post.findById(postId);
    //2. Find the login user
    const loginUserId = req?.user?._id;
    //3. Find is this user has liked this post?
    const isLiked = post?.isLiked;
    //4.Chech if this user has dislikes this post
    const alreadyDisliked = post?.disLikes?.find(
        userId => userId?.toString() === loginUserId?.toString()
    );
    //5.remove the user from dislikes array if exists
    if (alreadyDisliked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: { disLikes: loginUserId },
                isDisLiked: false,
            },
            { new: true }
        );
        res.json(post);
    }
    //Toggle
    //Remove the user if he has liked the post
    if (isLiked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true }
        );
        res.json(post);
    } else {
        //add to likes
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            { new: true }
        );
        res.json(post);
    }
})

//------------------------------
//DisLike
//------------------------------
const toggleAndDisLikePost = expressAsyncHandler(async (req, res) => {
    //1.Find the post to be disLiked
    const { postId } = req.body;
    const filter = { _id: postId };
    const post = await Post.findById(postId);
    //2.Find the login user
    const loginUserId = req?.user?._id;
    //3.Check if this user has already disLikes
    const isDisLiked = post?.isDisLiked;
    //4. Check if already like this post
    const alreadyLiked = post?.likes?.find(
        userId => userId.toString() === loginUserId?.toString()
    );
    //Remove this user from likes array if it exists
    if (alreadyLiked) {
        const post = await Post.findOneAndUpdate(
            filter,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true }
        );
        res.json(post);
    }
    //Toggling
    //Remove this user from dislikes if already disliked
    if (isDisLiked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: { disLikes: loginUserId },
                isDisLiked: false,
            },
            { new: true }
        );
        res.json(post);
    } else {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { disLikes: loginUserId },
                isDisLiked: true,
            },
            { new: true }
        );
        res.json(post);
    }
})
module.exports = { createPostCtrl, fetchPostsCtrl, fetchPostCtrl, updatePostCtrl, deletePostCtrl, toggleAndLikeToPost, toggleAndDisLikePost }