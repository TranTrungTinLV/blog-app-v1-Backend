const expressAsyncHandler = require("express-async-handler");

const jwt = require("jsonwebtoken");

const User = require("../../models/user/User")

const authMiddleWare = expressAsyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        //find the user id
        const user = await User.findById(decoded?.id).select("-password");
        //attach the user to the req obj
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Not authorized token expired, login again")
    }
  } else {
    throw new Error("There is no token attached to the header")
  }
})

module.exports = authMiddleWare;