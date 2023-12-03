const multer = require('multer');
const jimp = require('jimp');
const path = require('path');
//storage
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {

    // Liệt kê các định dạng hình ảnh được hỗ trợ
    const supportedFormats = ["image/jpeg", "image/png", "image/bmp", "image/tiff", "image/gif"];

    // Kiểm tra xem định dạng file có được hỗ trợ không
    if (supportedFormats.includes(file.mimetype)) {
        cb(null, true); // Chấp nhận file nếu định dạng được hỗ trợ
    } else {
        cb(new Error("Unsupported file format"), false); // Từ chối nếu định dạng không được hỗ trợ
    }
}

const photoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 2000000 }
});

//Image Resizing
const profilePhotoResize = async (req, res, next) => {
    if (!req.file) return next();
    req.file.fileName = `user-${Date.now()}-${req.file.originalname}`;
    // console.log(`Resize`, req.file);
    // Đọc file từ buffer
    const image = await jimp.read(req.file.buffer);

    image.resize(250, 250);
    // image.toFormat('jpeg');

    // Đảm bảo bạn sử dụng req.file.fileName thay vì req.file.filename
    await image.writeAsync(path.join(`public/images/profile/${req.file.fileName}.jpeg`));

    next();
}

//Post Image Resizing
const postImgResize = async (req, res, next) => {
    if (!req.file) return next();
    req.file.fileName = `user-${Date.now()}-${req.file.originalname}`;
    // console.log(`Resize`, req.file);
    // Đọc file từ buffer
    const image = await jimp.read(req.file.buffer);

    image.resize(500, 500);
    // image.toFormat('jpeg');

    // Đảm bảo bạn sử dụng req.file.fileName thay vì req.file.filename
    await image.writeAsync(path.join(`public/images/posts/${req.file.fileName}.jpeg`));

    next();
}


module.exports = { photoUpload, profilePhotoResize, postImgResize };