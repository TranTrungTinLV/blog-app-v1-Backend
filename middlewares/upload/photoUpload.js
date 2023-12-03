const multer = require('multer');
const jimp = require('jimp');
const path = require('path');
const sharp = require('sharp');

//storage
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }
}

//Image Resizing with sharp
const resizeImage = async (req, outputSize, outputPath) => {
    if (!req.file) return;

    req.file.fileName = `user-${Date.now()}-${req.file.originalname}`;

    // Sử dụng sharp để thay đổi kích thước và lưu hình ảnh
    await sharp(req.file.buffer)
        .resize(outputSize, outputSize)
        .toFormat('jpeg') // Chuyển đổi sang jpeg, bạn có thể thay đổi hoặc loại bỏ nếu muốn giữ nguyên định dạng
        .toFile(outputPath);
};

const photoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
    // public/images/profile/${req.file.fileName}.jpeg

//Image Resizing
const profilePhotoResize = async (req, res, next) => {
   //check if there is no file
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality:90 })
    .toFile(path.join(`public/images/profile/${req.file.filename}`));
  next();
};

//Post Image Resizing
const postImgResize = async (req, res, next) => {
    //check if there is no file
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/posts/${req.file.filename}`));
  next();
};


module.exports = { photoUpload, profilePhotoResize, postImgResize };