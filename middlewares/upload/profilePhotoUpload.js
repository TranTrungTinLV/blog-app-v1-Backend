const multer = require('multer');
const jimp = require('jimp');
const path = require('path');
//storage
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
    //check file type
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb({
            message: "Unsupported file format",
        }),
            false
    }
}

const profilePhotoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 1000000 }
});

const profilePhotoResize = async (req, res, next) => {
    if (!req.file) return next();
    req.file.fileName = `user-${Date.now()}-${req.file.originalname}`;
    console.log(`Resize`, req.file);
    // Đọc file từ buffer
    const image = await jimp.read(req.file.buffer);

    image.resize(250, 250);
    // image.toFormat('jpeg');

    // Đảm bảo bạn sử dụng req.file.fileName thay vì req.file.filename
    await image.writeAsync(path.join(`public/images/profile/${req.file.fileName}.jpeg`));

    next();
}


module.exports = { profilePhotoUpload, profilePhotoResize };