const express = require('express')
const { createPostCtrl, fetchPostsCtrl, fetchPostCtrl, updatePostCtrl, deletePostCtrl, toggleAndLikeToPost, toggleAndDisLikePost } = require('../../controllers/posts/PostCtrl');
const authMiddleWare = require('../../middlewares/auth/authMiddleware');
const { photoUpload, postImgResize } = require('../../middlewares/upload/photoUpload');

const postRoute = express.Router();

postRoute.post("/", authMiddleWare, photoUpload.single("image"), postImgResize, createPostCtrl);
postRoute.put('/likes', authMiddleWare, toggleAndLikeToPost)
postRoute.put('/dislikes', authMiddleWare, toggleAndDisLikePost)
postRoute.get('/', fetchPostsCtrl);
postRoute.get('/:id', fetchPostCtrl);
postRoute.put('/:id', authMiddleWare, updatePostCtrl);
postRoute.delete('/:id', authMiddleWare, deletePostCtrl)

module.exports = postRoute;
