const express = require('express')
const { createCommentCtrl, fetchAllCommentCtrl, fetchCommentCtrl, updateCommentCtrl, deleteCtrl } = require("../../controllers/comments/CommentCtrl");
const authMiddleWare = require('../../middlewares/auth/authMiddleware');
const commentRoutes = express.Router();

commentRoutes.post('/', authMiddleWare, createCommentCtrl);
commentRoutes.get('/', fetchAllCommentCtrl);
commentRoutes.get('/:id', authMiddleWare, fetchCommentCtrl);
commentRoutes.put('/:id', authMiddleWare, updateCommentCtrl);
commentRoutes.delete('/:id', authMiddleWare, deleteCtrl);

module.exports = commentRoutes