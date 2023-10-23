const mongoose = require('mongoose');

const validateMongoId = id=>{
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error("User id is not valid or found ")
};
module.exports = validateMongoId;