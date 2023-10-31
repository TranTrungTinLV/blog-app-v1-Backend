const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../models/comment/Comment");
const validateMongoId = require("../../utils/validateMongodbID");

//-------------------------------------------------------------
//Create
//-------------------------------------------------------------
const createCommentCtrl = expressAsyncHandler(async (req, res) => {
    //1.Get the user
    const user = req.user;
    //2.Get the post Id
    const { postId, description } = req.body;
    console.log(description);
    try {
        const comment = await Comment.create({
            post: postId,
            user,
            description,
        });
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

//-------------------------------
//fetch all comments
//-------------------------------

const fetchAllCommentCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const comments = await Comment.find({}).sort("-created");
        res.json(comments);
    } catch (error) {
        res.json(error);
    }
});

//------------------------------
//commet details
//------------------------------
const fetchCommentCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findById(id);
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

//------------------------------
//Update
//------------------------------
const updateCommentCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const update = await Comment.findByIdAndUpdate(
            id,
            {
                post: req.body?.postId,  // Check if "postId" is in the request body
                user: req?.user,         // Check if "user" is in the request body
                description: req?.body?.description,  // Check if "description" is in the request body
            },
            {
                new: true,
                runValidators: true,
            }
        );
        res.json(update);
        console.log(update);
    } catch (error) {
        res.json(error);
    }
});

//---------------------
//Delete
//---------------------
const deleteCtrl = expressAsyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try{
        const comment = await Comment.findByIdAndDelete(id);
        res.json(comment)
    }catch(error){
        res.json(error)
    }
})

module.exports = { createCommentCtrl, fetchAllCommentCtrl, fetchCommentCtrl, updateCommentCtrl, deleteCtrl }