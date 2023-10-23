const express = require('express');
const { userRegisterCtrl, loginUserCtrl, fetchUserCtrl, deleteUserCtrl, fetchUserDetailsCtrl, userProfileCtrl, updateUserCtrl,updatePassWordCtrl } = require('../../controllers/user/UserCtrl');
const userRoutes = express.Router();
const authMiddleWare = require("../../middlewares/auth/authMiddleware")

userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.get("/", authMiddleWare, fetchUserCtrl);
userRoutes.get("/profile/:id", authMiddleWare, userProfileCtrl);
userRoutes.put("/:id", authMiddleWare, updateUserCtrl);
userRoutes.put("/password/:id", authMiddleWare, updatePassWordCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", fetchUserDetailsCtrl);

module.exports = userRoutes;