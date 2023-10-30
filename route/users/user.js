const express = require('express');
const { userRegisterCtrl, loginUserCtrl, fetchUserCtrl, deleteUserCtrl, fetchUserDetailsCtrl, userProfileCtrl, updateUserCtrl, updatePassWordCtrl, followingUserCtrl, unFollowerCtrl, blockUserCtrl, unBlockUserCtrl, generationVerificationTokenCtrl, accountVerificationCtrl, ForgotPassWordToken, passwordResetCtrl, profilePhotoUploadCtrl } = require('../../controllers/user/UserCtrl');
const userRoutes = express.Router();
const authMiddleWare = require("../../middlewares/auth/authMiddleware");
const { photoUpload, profilePhotoResize } = require('../../middlewares/upload/photoUpload');

userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.put("/profile-upload-photo", authMiddleWare, photoUpload.single('image'),profilePhotoResize, profilePhotoUploadCtrl);
userRoutes.get("/", authMiddleWare, fetchUserCtrl);
//Password Reset
userRoutes.post("/forget-password-token", ForgotPassWordToken);
userRoutes.put("/reset-password", passwordResetCtrl);
userRoutes.put("/password", authMiddleWare, updatePassWordCtrl);
userRoutes.put("/follow", authMiddleWare, followingUserCtrl);
userRoutes.put("/unfollow", authMiddleWare, unFollowerCtrl);
userRoutes.put("/block-user/:id", authMiddleWare, blockUserCtrl);
userRoutes.put("/unblock-user/:id", authMiddleWare, unBlockUserCtrl);
userRoutes.post("/generate-verify-email-token", authMiddleWare, generationVerificationTokenCtrl);
userRoutes.put("/verify-account", authMiddleWare, accountVerificationCtrl);
userRoutes.get("/profile/:id", authMiddleWare, userProfileCtrl);
userRoutes.put("/:id", authMiddleWare, updateUserCtrl);
userRoutes.put("/:id", authMiddleWare, updateUserCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", fetchUserDetailsCtrl);

module.exports = userRoutes;