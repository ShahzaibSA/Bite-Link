const multer = require('multer');
// const fs = require('node:fs');
// const path = require('node:path');

const storage = multer.memoryStorage();

module.exports = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  }
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const folderName = './uploads';
//     if (!fs.existsSync(folderName)) {
//       fs.mkdirSync(folderName);
//     }
//     cb(null, folderName);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${file.fieldname}-${req.user._id}${path.extname(file.originalname)}`);
//   }
// });
// module.exports = multer({
//   storage: storage,
//   limits: { fileSize: 5000000 },
//   fileFilter: function (req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error('Please upload an image'));
//     }
//     cb(null, true);
//   }
// });
